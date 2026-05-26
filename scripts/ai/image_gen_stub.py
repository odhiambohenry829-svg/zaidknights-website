"""
Image generation stub examples. Providers vary; this shows a placeholder for OpenAI or other image APIs.
"""
import os

API_PROVIDER = os.getenv('IMAGE_PROVIDER', 'openai')


def generate_image(prompt: str, size: str = '1024x1024') -> dict:
    if API_PROVIDER == 'openai':
        return {'status': 'stub', 'provider': 'openai', 'prompt': prompt}
    elif API_PROVIDER == 'stability':
        return {'status': 'stub', 'provider': 'stability', 'prompt': prompt}
    else:
        return {'status': 'error', 'reason': 'no provider configured'}


if __name__ == '__main__':
    print(generate_image('A stylized chessboard with dramatic lighting'))
