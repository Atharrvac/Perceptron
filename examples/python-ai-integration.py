"""
Python Example: AI Integration with OpenAI and OpenRouter

This example demonstrates how to create a production-ready AI service
that supports both OpenAI and OpenRouter APIs with automatic provider detection.

Requirements:
    pip install openai python-dotenv flask

Usage:
    python python-ai-integration.py
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Union, Any
from dataclasses import dataclass

import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# API Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')

# Provider configurations
PROVIDER_CONFIGS = {
    'openai': {
        'base_url': 'https://api.openai.com/v1',
        'models': {
            'chat': 'gpt-3.5-turbo',
            'chat_advanced': 'gpt-4',
        }
    },
    'openrouter': {
        'base_url': 'https://openrouter.ai/api/v1',
        'models': {
            'chat': 'microsoft/wizardlm-2-8x22b',
            'chat_advanced': 'anthropic/claude-3.5-sonnet',
            'chat_fast': 'meta-llama/llama-3.1-8b-instruct:free',
        }
    }
}

@dataclass
class AIResponse:
    """Standardized AI response structure"""
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    provider: Optional[str] = None
    model: Optional[str] = None
    code: Optional[str] = None
    timestamp: Optional[str] = None

    def to_dict(self) -> Dict:
        return {
            'success': self.success,
            'data': self.data,
            'error': self.error,
            'provider': self.provider,
            'model': self.model,
            'code': self.code,
            'timestamp': self.timestamp or datetime.now().isoformat()
        }

class AIService:
    """Production-ready AI service supporting multiple providers"""
    
    def __init__(self):
        self.openai_client: Optional[openai.OpenAI] = None
        self.openrouter_client: Optional[openai.OpenAI] = None
        self.active_provider: Optional[str] = None
        self._initialize_clients()

    def _initialize_clients(self) -> None:
        """Initialize AI clients based on available API keys"""
        
        # Initialize OpenAI client
        if OPENAI_API_KEY and OPENAI_API_KEY.strip():
            try:
                self.openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)
                logger.info("✅ OpenAI client initialized")
            except Exception as error:
                logger.error(f"❌ Failed to initialize OpenAI client: {error}")

        # Initialize OpenRouter client
        if OPENROUTER_API_KEY and OPENROUTER_API_KEY.strip():
            try:
                self.openrouter_client = openai.OpenAI(
                    api_key=OPENROUTER_API_KEY,
                    base_url=PROVIDER_CONFIGS['openrouter']['base_url'],
                    default_headers={
                        "HTTP-Referer": "https://your-app-domain.com",
                        "X-Title": "Your App Name"
                    }
                )
                logger.info("✅ OpenRouter client initialized")
            except Exception as error:
                logger.error(f"❌ Failed to initialize OpenRouter client: {error}")

        # Set active provider (prefer OpenRouter if both available)
        if self.openrouter_client:
            self.active_provider = 'openrouter'
            logger.info("🎯 Using OpenRouter as primary provider")
        elif self.openai_client:
            self.active_provider = 'openai'
            logger.info("🎯 Using OpenAI as primary provider")
        else:
            self.active_provider = None
            logger.warning("⚠️ No AI API keys configured. AI features will be disabled.")

    def _get_client(self, provider: str = 'auto') -> Optional[Dict[str, Any]]:
        """Get the appropriate client for the specified provider"""
        target_provider = self.active_provider if provider == 'auto' else provider

        if target_provider == 'openai' and self.openai_client:
            return {'client': self.openai_client, 'provider_name': 'openai'}
        elif target_provider == 'openrouter' and self.openrouter_client:
            return {'client': self.openrouter_client, 'provider_name': 'openrouter'}
        
        return None

    def _get_model(self, provider: str, model_type: str = 'chat') -> str:
        """Get the appropriate model for the provider and type"""
        config = PROVIDER_CONFIGS.get(provider, {})
        models = config.get('models', {})
        return models.get(model_type, models.get('chat', 'gpt-3.5-turbo'))

    def _create_error_response(self, error: str, provider: str = None, code: str = None) -> AIResponse:
        """Create standardized error response"""
        return AIResponse(
            success=False,
            error=error,
            provider=provider,
            code=code,
            timestamp=datetime.now().isoformat()
        )

    def _create_success_response(self, data: Any, provider: str, model: str) -> AIResponse:
        """Create standardized success response"""
        return AIResponse(
            success=True,
            data=data,
            provider=provider,
            model=model,
            timestamp=datetime.now().isoformat()
        )

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        provider: str = 'auto',
        model: str = None,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> AIResponse:
        """
        Perform chat completion with automatic provider selection
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            provider: 'auto', 'openai', or 'openrouter'
            model: Specific model to use (optional)
            temperature: Creativity level (0.0-1.0)
            max_tokens: Maximum response length
        
        Returns:
            AIResponse object with result or error
        """
        client_info = self._get_client(provider)
        if not client_info:
            return self._create_error_response(
                "No AI provider available. Please configure API keys in .env file."
            )

        client = client_info['client']
        provider_name = client_info['provider_name']
        selected_model = model or self._get_model(provider_name, 'chat')

        try:
            logger.info(f"🚀 Making request to {provider_name} with model {selected_model}")
            
            response = client.chat.completions.create(
                model=selected_model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )

            content = response.choices[0].message.content if response.choices else None
            if content:
                return self._create_success_response(
                    {
                        'content': content.strip(),
                        'usage': response.usage.model_dump() if response.usage else None,
                        'finish_reason': response.choices[0].finish_reason if response.choices else None
                    },
                    provider_name,
                    selected_model
                )
            else:
                return self._create_error_response("No content returned from AI service", provider_name)

        except Exception as error:
            logger.error(f"❌ Error with {provider_name}: {error}")
            
            # Handle specific error types
            error_str = str(error)
            if "401" in error_str or "invalid" in error_str.lower():
                return self._create_error_response(
                    "Invalid API key. Please check your credentials.",
                    provider_name,
                    "INVALID_API_KEY"
                )
            elif "429" in error_str or "rate limit" in error_str.lower():
                return self._create_error_response(
                    "Rate limit exceeded. Please try again later.",
                    provider_name,
                    "RATE_LIMIT"
                )
            elif any(code in error_str for code in ["500", "502", "503"]):
                return self._create_error_response(
                    "AI service temporarily unavailable. Please try again.",
                    provider_name,
                    "SERVICE_UNAVAILABLE"
                )

            return self._create_error_response(
                str(error),
                provider_name,
                "UNKNOWN_ERROR"
            )

    def chat_completion_sync(
        self,
        messages: List[Dict[str, str]],
        provider: str = 'auto',
        model: str = None,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> AIResponse:
        """Synchronous version of chat_completion"""
        client_info = self._get_client(provider)
        if not client_info:
            return self._create_error_response(
                "No AI provider available. Please configure API keys in .env file."
            )

        client = client_info['client']
        provider_name = client_info['provider_name']
        selected_model = model or self._get_model(provider_name, 'chat')

        try:
            logger.info(f"🚀 Making request to {provider_name} with model {selected_model}")
            
            response = client.chat.completions.create(
                model=selected_model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )

            content = response.choices[0].message.content if response.choices else None
            if content:
                return self._create_success_response(
                    {
                        'content': content.strip(),
                        'usage': response.usage.model_dump() if response.usage else None,
                        'finish_reason': response.choices[0].finish_reason if response.choices else None
                    },
                    provider_name,
                    selected_model
                )
            else:
                return self._create_error_response("No content returned from AI service", provider_name)

        except Exception as error:
            logger.error(f"❌ Error with {provider_name}: {error}")
            return self._create_error_response(str(error), provider_name, "REQUEST_FAILED")

    def validate_provider(self, provider: str) -> AIResponse:
        """Validate that a provider is working correctly"""
        client_info = self._get_client(provider)
        if not client_info:
            return self._create_error_response(f"Provider {provider} not available or not configured")

        try:
            client = client_info['client']
            provider_name = client_info['provider_name']
            model = self._get_model(provider_name, 'chat')
            
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=5
            )

            if response.choices and response.choices[0].message.content:
                return self._create_success_response(True, provider_name, model)
            else:
                return self._create_error_response("Provider validation failed", provider_name)
        except Exception as error:
            return self._create_error_response(
                f"Provider validation failed: {error}",
                provider,
                "VALIDATION_FAILED"
            )

    def get_status(self) -> Dict[str, Any]:
        """Get the current status of the AI service"""
        available_providers = []
        if self.openai_client:
            available_providers.append('openai')
        if self.openrouter_client:
            available_providers.append('openrouter')

        return {
            'openai_available': bool(self.openai_client),
            'openrouter_available': bool(self.openrouter_client),
            'active_provider': self.active_provider,
            'available_providers': available_providers
        }

def run_examples():
    """Run example usage of the AI service"""
    print("🚀 Initializing AI Service...\n")
    
    ai_service = AIService()
    
    # Check service status
    print("📊 Service Status:")
    print(json.dumps(ai_service.get_status(), indent=2))
    print()

    # Example 1: Simple chat completion
    print("💬 Example 1: Simple Chat Completion")
    chat_result = ai_service.chat_completion_sync([
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is the capital of France?"}
    ])
    
    print("Result:", json.dumps(chat_result.to_dict(), indent=2))
    print()

    # Example 2: Using specific provider and model
    print("🎯 Example 2: Specific Provider and Model")
    specific_result = ai_service.chat_completion_sync([
        {"role": "user", "content": "Explain quantum computing in simple terms"}
    ], provider='auto', temperature=0.3, max_tokens=500)
    
    print("Result:", json.dumps(specific_result.to_dict(), indent=2))
    print()

    # Example 3: Provider validation
    print("✅ Example 3: Provider Validation")
    available_providers = ai_service.get_status()['available_providers']
    
    for provider in available_providers:
        validation = ai_service.validate_provider(provider)
        status = "✅ Valid" if validation.success else "❌ Invalid"
        print(f"{provider}: {status}")
        if not validation.success:
            print(f"  Error: {validation.error}")
    print()

    # Example 4: Error handling
    print("🚨 Example 4: Error Handling")
    error_result = ai_service.chat_completion_sync([
        {"role": "user", "content": "Hello"}
    ], provider='nonexistent')
    
    print("Error Result:", json.dumps(error_result.to_dict(), indent=2))

# Flask API example
def create_flask_endpoints():
    """Create Flask API endpoints for the AI service"""
    from flask import Flask, request, jsonify
    
    app = Flask(__name__)
    ai_service = AIService()

    @app.route('/api/chat/completion', methods=['POST'])
    def chat_completion():
        try:
            data = request.get_json()
            
            if not data or 'messages' not in data:
                return jsonify({
                    'success': False,
                    'error': "Invalid request: 'messages' array is required"
                }), 400

            messages = data['messages']
            options = data.get('options', {})
            
            result = ai_service.chat_completion_sync(
                messages,
                provider=options.get('provider', 'auto'),
                model=options.get('model'),
                temperature=options.get('temperature', 0.7),
                max_tokens=options.get('max_tokens', 2000)
            )
            
            if result.success:
                return jsonify(result.to_dict())
            else:
                status_code = 401 if result.code == 'INVALID_API_KEY' else \
                             429 if result.code == 'RATE_LIMIT' else \
                             503 if result.code == 'SERVICE_UNAVAILABLE' else 400
                return jsonify(result.to_dict()), status_code
                
        except Exception as error:
            return jsonify({
                'success': False,
                'error': "Internal server error",
                'message': str(error)
            }), 500

    @app.route('/api/ai/status', methods=['GET'])
    def ai_status():
        return jsonify(ai_service.get_status())

    @app.route('/api/ai/validate/<provider>', methods=['POST'])
    def validate_provider(provider):
        result = ai_service.validate_provider(provider)
        
        if result.success:
            return jsonify(result.to_dict())
        else:
            return jsonify(result.to_dict()), 400

    return app

if __name__ == "__main__":
    # Run examples
    run_examples()
    
    # Optionally run Flask server
    # app = create_flask_endpoints()
    # app.run(debug=True, port=5000)
