import { AIProviderConfig } from './types';

export async function analyzeUrlWithAI(url: string, config: AIProviderConfig): Promise<string> {
  const prompt = `Você é o URLGuard, um assistente avançado de cibersegurança e privacidade de links.
Analise detalhadamente a seguinte URL para identificar possíveis riscos de segurança (phishing, malware, domínios falsificados/homóglifos, protocolos inseguros), rastreamento excessivo de dados (tracking parameters, cookies de monitoramento) ou intenções de redirecionamento enganoso.

URL a ser analisada: ${url}

Responda em português (Portugal) com o seguinte formato estruturado em Markdown:
1. **Veredito de Segurança**: [SEGURO / SUSPEITO / PERIGOSO] (explicando brevemente a razão em uma frase, use cores ou badges de destaque).
2. **Análise de Privacidade & Rastreamento**: (parâmetros de tracking, publicidade, etc).
3. **Análise de Ameaças**: (phishing, homógrafo, malware, etc).
4. **Recomendação**: (o que o usuário deve fazer ao clicar ou se deve evitar).

Seja conciso, direto e profissional. Mantenha a resposta com menos de 180 palavras.`;

  if (!config.apiKey) {
    throw new Error('Chave de API (API Key) não fornecida. Configure-a na aba Alertas e Configs.');
  }

  const provider = config.provider;
  const endpoint = config.apiEndpoint || getDefaultEndpoint(provider);
  const model = config.model || getDefaultModel(provider);

  try {
    if (provider === 'gemini') {
      // Format URL for Google's native Gemini API
      // If endpoint contains '/v1beta/models', we will use it, otherwise build the standard path
      let cleanUrl = endpoint;
      if (!cleanUrl.includes('generateContent')) {
        // e.g. https://generativelanguage.googleapis.com/v1beta/models
        const base = cleanUrl.endsWith('/') ? cleanUrl.slice(0, -1) : cleanUrl;
        cleanUrl = `${base}/${model}:generateContent?key=${config.apiKey}`;
      } else {
        // user provided full URL with key placeholder or we append
        if (!cleanUrl.includes('key=')) {
          cleanUrl = `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}key=${config.apiKey}`;
        }
      }

      const response = await fetch(cleanUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API do Gemini (${response.status}): ${errorText || response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('A API do Gemini retornou uma resposta sem conteúdo de texto.');
      }
      return text;
    } else {
      // OpenAI, OpenRouter, and Custom (all chat/completions compatible)
      let cleanUrl = endpoint;
      if (!cleanUrl.endsWith('/chat/completions') && !cleanUrl.includes('/chat/completions')) {
        cleanUrl = cleanUrl.endsWith('/') ? `${cleanUrl}chat/completions` : `${cleanUrl}/chat/completions`;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      };

      // OpenRouter special headers
      if (provider === 'openrouter') {
        headers['HTTP-Referer'] = window.location.href;
        headers['X-Title'] = 'URLGuard Security';
      }

      const response = await fetch(cleanUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API do Provedor (${response.status}): ${errorText || response.statusText}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error('O provedor de IA retornou uma resposta vazia.');
      }
      return text;
    }
  } catch (error: any) {
    console.error('AI Analysis fetch error:', error);
    throw new Error(error.message || 'Erro de rede ou de comunicação com o provedor de IA.');
  }
}

export function getDefaultEndpoint(provider: string): string {
  switch (provider) {
    case 'gemini':
      return 'https://generativelanguage.googleapis.com/v1beta/models';
    case 'openai':
      return 'https://api.openai.com/v1';
    case 'openrouter':
      return 'https://openrouter.ai/api/v1';
    default:
      return '';
  }
}

export function getDefaultModel(provider: string): string {
  switch (provider) {
    case 'gemini':
      return 'gemini-2.5-flash';
    case 'openai':
      return 'gpt-4o-mini';
    case 'openrouter':
      return 'google/gemini-2.5-flash';
    default:
      return '';
  }
}
