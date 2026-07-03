import { Rule, ThreatConfig, SecurityAlert } from './types';

export const TRACKING_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
  'fbclid', 'gclid', 'gclsrc', 'msclkid', 'yclid', 'mc_eid', '_hsenc', '_hsmi',
  's_kwcid', 'igshid', 'twclid', 'tt_elg', 'aff_id', 'aff_sub', 'ref', 'referrer',
  'origin', 'source', 'spm', 'campaign_id', 'clickid', 'tracking'
];

export function cleanTrackers(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    const params = new URLSearchParams(url.search);
    const keysToDelete: string[] = [];

    params.forEach((value, key) => {
      if (TRACKING_PARAMS.includes(key.toLowerCase())) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => params.delete(key));
    url.search = params.toString();
    return url.toString();
  } catch (e) {
    return urlStr;
  }
}

export function applyRules(urlStr: string, rules: Rule[]): string {
  let processedUrl = urlStr;
  try {
    for (const rule of rules) {
      if (rule.active) {
        const regex = new RegExp(rule.regex, 'i');
        if (regex.test(processedUrl)) {
          processedUrl = processedUrl.replace(regex, rule.replacement);
          if (rule.isDecode) {
            processedUrl = decodeURIComponent(processedUrl);
          }
        }
      }
    }
    return processedUrl;
  } catch (e) {
    return urlStr;
  }
}

export function isSuspicious(hostname: string): boolean {
  const suspiciousKeywords = ['login', 'secure', 'auth', 'verify', 'update', 'account', 'free', 'gift', 'win'];
  return suspiciousKeywords.some(keyword => hostname.includes(keyword));
}

export function isHomograph(hostname: string): boolean {
  // Simple check for non-ASCII characters in hostname
  return /[^\x00-\x7F]/.test(hostname);
}

export function scanThreats(urlStr: string, configs: ThreatConfig[]): Omit<SecurityAlert, 'id' | 'timestamp' | 'dismissed'>[] {
  const alerts: Omit<SecurityAlert, 'id' | 'timestamp' | 'dismissed'>[] = [];
  try {
    const url = new URL(urlStr);
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname.toLowerCase();
    
    // 1. Unsecure HTTP
    const httpConfig = configs.find(c => c.id === 'unsecure_http');
    if (httpConfig && httpConfig.enabled && url.protocol === 'http:') {
      alerts.push({
        threatId: 'unsecure_http',
        threatName: httpConfig.name,
        url: urlStr,
        message: 'Esta URL utiliza o protocolo "http://" sem encriptação SSL/TLS, permitindo a interceção de dados em redes públicas.',
        priority: httpConfig.priority
      });
    }

    // 2. Malware/Downloads
    const malwareConfig = configs.find(c => c.id === 'malware');
    if (malwareConfig && malwareConfig.enabled) {
      const dangerousExtensions = ['.exe', '.dmg', '.pkg', '.zip', '.rar', '.bat', '.cmd', '.sh', '.scr', '.msi', '.apk'];
      const hasDangerousExt = dangerousExtensions.some(ext => pathname.endsWith(ext) || pathname.includes(ext + '?') || pathname.includes(ext + '/'));
      if (hasDangerousExt) {
        alerts.push({
          threatId: 'malware',
          threatName: malwareConfig.name,
          url: urlStr,
          message: 'Esta URL aponta para um ficheiro executável ou comprimido perigosamente propício a conter malware ou scripts maliciosos.',
          priority: malwareConfig.priority
        });
      }
    }

    // 3. Phishing
    const phishingConfig = configs.find(c => c.id === 'phishing');
    if (phishingConfig && phishingConfig.enabled) {
      const trustedDomains = ['google.com', 'microsoft.com', 'facebook.com', 'apple.com', 'twitter.com', 'x.com', 'github.com', 'linkedin.com', 'paypal.com', 'netflix.com', 'amazon.com', 'youtube.com'];
      const isTrusted = trustedDomains.some(domain => hostname === domain || hostname.endsWith('.' + domain));
      if (!isTrusted) {
        const phishingKeywords = ['login', 'auth', 'verify', 'secure', 'update', 'account', 'signin', 'recuperar', 'senha', 'banco'];
        const matchedKeyword = phishingKeywords.find(keyword => hostname.includes(keyword));
        if (matchedKeyword) {
          alerts.push({
            threatId: 'phishing',
            threatName: phishingConfig.name,
            url: urlStr,
            message: `Domínio não verificado contém o termo "${matchedKeyword}", simulando uma página de autenticação legítima.`,
            priority: phishingConfig.priority
          });
        }
      }
    }

    // 4. Suspicious Domain
    const suspiciousConfig = configs.find(c => c.id === 'suspicious_domain');
    if (suspiciousConfig && suspiciousConfig.enabled) {
      const suspiciousKeywords = ['win', 'free', 'gift', 'prize', 'giveaway', 'bonus', 'claim', 'promo', 'click', 'cash', 'sorteio', 'gratis'];
      const matchedKeyword = suspiciousKeywords.find(keyword => hostname.includes(keyword));
      const isHomographHost = /[^\x00-\x7F]/.test(hostname);
      
      if (matchedKeyword) {
        alerts.push({
          threatId: 'suspicious_domain',
          threatName: suspiciousConfig.name,
          url: urlStr,
          message: `O endereço contém o termo isca promocional "${matchedKeyword}", típico de burlas de engenharia social.`,
          priority: suspiciousConfig.priority
        });
      } else if (isHomographHost) {
        alerts.push({
          threatId: 'suspicious_domain',
          threatName: suspiciousConfig.name,
          url: urlStr,
          message: 'O domínio utiliza caracteres não-ASCII (ataque homógrafo) que podem imitar marcas famosas.',
          priority: suspiciousConfig.priority
        });
      }
    }

    // 5. Heavy Tracking
    const trackingConfig = configs.find(c => c.id === 'tracking_heavy');
    if (trackingConfig && trackingConfig.enabled) {
      const trackingParamsInUrl = Array.from(url.searchParams.keys()).filter(key => 
        TRACKING_PARAMS.includes(key.toLowerCase())
      );
      if (trackingParamsInUrl.length > 3) {
        alerts.push({
          threatId: 'tracking_heavy',
          threatName: trackingConfig.name,
          url: urlStr,
          message: `Esta URL contém um volume excessivo de parâmetros de monitorização (${trackingParamsInUrl.length} identificados) para rastreio do utilizador.`,
          priority: trackingConfig.priority
        });
      }
    }

    // 6. URL Shorteners
    const shortenerConfig = configs.find(c => c.id === 'url_shorteners');
    if (shortenerConfig && shortenerConfig.enabled) {
      const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'buff.ly', 'adf.ly', 'ouo.io', 'rebrand.ly', 'cutt.ly', 'tiny.cc', 'lnkd.in', 'shorte.st', 'v.gd', 'mcaf.ee', 'su.pr'];
      const isShortener = shorteners.some(s => hostname === s || hostname.endsWith('.' + s));
      if (isShortener) {
        alerts.push({
          threatId: 'url_shorteners',
          threatName: shortenerConfig.name,
          url: urlStr,
          message: 'Esta URL usa um serviço de encurtamento que mascara o destino real do link. Tenha cautela ao prosseguir.',
          priority: shortenerConfig.priority
        });
      }
    }

    // 7. Raw IP Domain
    const rawIpConfig = configs.find(c => c.id === 'raw_ips');
    if (rawIpConfig && rawIpConfig.enabled) {
      const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
      if (ipRegex.test(hostname)) {
        alerts.push({
          threatId: 'raw_ips',
          threatName: rawIpConfig.name,
          url: urlStr,
          message: 'Esta URL usa um endereço IP numérico direto em vez de um domínio registado, um indicador comum de servidores maliciosos ou phishing.',
          priority: rawIpConfig.priority
        });
      }
    }

    // 8. Deep Nested Subdomains (Phishing)
    const deepSubdomainConfig = configs.find(c => c.id === 'deep_subdomains');
    if (deepSubdomainConfig && deepSubdomainConfig.enabled) {
      const parts = hostname.replace('www.', '').split('.');
      if (parts.length > 3) {
        alerts.push({
          threatId: 'deep_subdomains',
          threatName: deepSubdomainConfig.name,
          url: urlStr,
          message: `Esta URL contém uma quantidade excessiva de subdomínios (${parts.length - 1}), frequentemente usados para imitar marcas famosas e ocultar domínios falsos.`,
          priority: deepSubdomainConfig.priority
        });
      }
    }

    // 9. Suspicious Ports
    const suspiciousPortsConfig = configs.find(c => c.id === 'suspicious_ports');
    if (suspiciousPortsConfig && suspiciousPortsConfig.enabled) {
      if (url.port && url.port !== '80' && url.port !== '443') {
        alerts.push({
          threatId: 'suspicious_ports',
          threatName: suspiciousPortsConfig.name,
          url: urlStr,
          message: `Esta URL aponta para a porta não-padrão ":${url.port}", o que pode expor serviços de desenvolvimento vulneráveis ou servidores ilegítimos.`,
          priority: suspiciousPortsConfig.priority
        });
      }
    }

    // 10. Double Extensions
    const doubleExtensionsConfig = configs.find(c => c.id === 'double_extensions');
    if (doubleExtensionsConfig && doubleExtensionsConfig.enabled) {
      const doubleExtRegex = /\.(pdf|doc|docx|png|jpg|mp3|zip)\.(exe|bat|cmd|sh|scr|msi|apk|vbs|js|vbe)$/i;
      if (doubleExtRegex.test(pathname)) {
        const match = pathname.match(doubleExtRegex);
        alerts.push({
          threatId: 'double_extensions',
          threatName: doubleExtensionsConfig.name,
          url: urlStr,
          message: `Extensão falsa detetada: o arquivo aparenta ser um "${match?.[1]}" mas na realidade é um executável perigoso "${match?.[2]}".`,
          priority: doubleExtensionsConfig.priority
        });
      }
    }

  } catch (e) {}
  return alerts;
}
