# HeatTheMap - Setup Guide

Bu kılavuz, projeyi klonladıktan sonra yapmanız gereken konfigürasyon adımlarını içerir.

## Gerekli Konfigürasyon Dosyaları

### 1. API Konfigürasyonu

`HeatTheMap.Api/appsettings.Development.json` dosyasını oluşturun:

```bash
cp HeatTheMap.Api/appsettings.Development.json.example HeatTheMap.Api/appsettings.Development.json
```

Ardından bu dosyayı düzenleyerek aşağıdaki değerleri kendinize göre ayarlayın:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "Jwt": {
    "Key": "BURAYA-KENDI-SECRET-KEYINIZI-YAZIN-EN-AZ-256-BIT",
    "Issuer": "HeatTheMap.Api",
    "Audience": "HeatTheMap.Web"
  },
  "Ollama": {
    "BaseUrl": "http://localhost:11434"
  },
  "Auth": {
    "DefaultUsername": "admin",
    "DefaultPassword": "BURAYA-GUCLU-BIR-SIFRE"
  }
}
```

**Önemli Notlar:**
- `Jwt:Key` değeri en az 256 bit (32 karakter) olmalıdır
- `Auth:DefaultPassword` değerini mutlaka değiştirin
- Production ortamında daha güvenli authentication mekanizmaları kullanın

### 2. Web Konfigürasyonu

`HeatTheMap.Web/.env` dosyasını oluşturun:

```bash
cp HeatTheMap.Web/.env.example HeatTheMap.Web/.env
```

İçeriği:
```
VITE_API_URL=http://localhost:5000
```

## JWT Secret Key Oluşturma

Güvenli bir JWT key oluşturmak için aşağıdaki yöntemlerden birini kullanabilirsiniz:

### PowerShell (Windows):
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### OpenSSL:
```bash
openssl rand -base64 64
```

### Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

## Güvenlik Uyarıları

⚠️ **Bu dosyaları asla Git'e commit etmeyin:**
- `HeatTheMap.Api/appsettings.Development.json`
- `HeatTheMap.Web/.env`

✅ Bu dosyalar `.gitignore` tarafından otomatik olarak ignore edilmektedir.

## Projeyi Çalıştırma

Konfigürasyon dosyalarını oluşturduktan sonra projeyi normal şekilde çalıştırabilirsiniz:

```bash
dotnet run
```

## İlk Giriş

Varsayılan giriş bilgileri (appsettings.Development.json'da tanımladıklarınız):
- **Kullanıcı Adı:** appsettings'de tanımladığınız username
- **Şifre:** appsettings'de tanımladığınız password

Production ortamında mutlaka bu değerleri değiştirin ve daha güvenli bir authentication sistemi kullanın.
