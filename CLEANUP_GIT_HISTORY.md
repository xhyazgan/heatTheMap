# Git History'den Hassas Bilgileri Temizleme

Bu kılavuz, geçmiş commit'lerde expose olmuş hassas bilgileri Git history'den tamamen kaldırmanız için adım adım talimatlar içerir.

## ⚠️ ÖNEMLİ UYARILAR

1. **Bu işlem geri alınamaz!** Mutlaka yedek alın
2. **Git history'yi yeniden yazacak** - Bu zorlamalı push (force push) gerektirir
3. **Takım çalışmasında dikkatli olun** - Diğer geliştiriciler repository'yi yeniden klonlamalı
4. **Public repo için**: Hassas bilgiler zaten internette paylaşılmış olabilir

## 🎯 Hangi Yöntemi Kullanmalı?

| Yöntem | Önerilen | Hız | Kullanım Kolaylığı |
|--------|----------|-----|-------------------|
| **BFG Repo-Cleaner** | ✅ En İyi | ⚡⚡⚡ Çok Hızlı | 😊 Kolay |
| **git filter-repo** | ✅ İyi | ⚡⚡ Hızlı | 🤔 Orta |
| **git filter-branch** | ❌ Eski | ⚡ Yavaş | 😰 Zor |

---

## Yöntem 1: BFG Repo-Cleaner (ÖNERİLEN)

### Kurulum

```bash
# Chocolatey ile (Windows)
choco install bfg-repo-cleaner

# Veya manuel indirme
# https://rtyley.github.io/bfg-repo-cleaner/
```

### Kullanım

```bash
# 1. Repository'nizin bir yedeğini alın
cd ..
git clone --mirror https://github.com/xhyazgan/heatTheMap.git heatTheMap-backup

# 2. Orijinal repo'ya dönün
cd heatTheMap

# 3. Belirli bir dosyayı tüm history'den silin
java -jar bfg.jar --delete-files appsettings.Development.json

# 4. Belirli bir string'i değiştirin (örn: JWT key)
echo "your-super-secret-key-that-is-at-least-256-bits-long-for-development" > secrets.txt
java -jar bfg.jar --replace-text secrets.txt

# 5. .env dosyalarını silin
java -jar bfg.jar --delete-files .env

# 6. Git'i temizleyin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 7. Değişiklikleri kontrol edin
git log --all --oneline --graph

# 8. Force push yapın (DIKKAT: Geri alınamaz!)
git push --force --all
git push --force --tags
```

---

## Yöntem 2: git filter-repo (Alternatif)

### Kurulum

```bash
# Python pip ile
pip install git-filter-repo

# Veya Chocolatey ile (Windows)
choco install git-filter-repo
```

### Kullanım

```bash
# 1. Fresh clone alın (önemli!)
cd ..
git clone https://github.com/xhyazgan/heatTheMap.git heatTheMap-clean
cd heatTheMap-clean

# 2. Belirli dosyaları silin
git filter-repo --path HeatTheMap.Api/appsettings.Development.json --invert-paths
git filter-repo --path HeatTheMap.Web/.env --invert-paths

# 3. Belirli text'leri değiştirin
git filter-repo --replace-text <(echo "your-super-secret-key-that-is-at-least-256-bits-long-for-development==>***REMOVED***")

# 4. Remote'u yeniden ekleyin (filter-repo otomatik kaldırır)
git remote add origin https://github.com/xhyazgan/heatTheMap.git

# 5. Force push
git push --force --all
git push --force --tags
```

---

## Yöntem 3: git filter-branch (Eski Yöntem)

**Not:** Bu yöntem artık önerilmiyor ama bazı durumlarda gerekebilir.

```bash
# Belirli bir dosyayı history'den kaldır
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch HeatTheMap.Api/appsettings.Development.json" \
  --prune-empty --tag-name-filter cat -- --all

# Git'i temizle
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push --force --all
git push --force --tags
```

---

## 📋 Temizlenmesi Gereken Dosyalar

Sizin projeniz için:

```bash
# Bu dosyaları Git history'den kaldırın:
HeatTheMap.Api/appsettings.Development.json
HeatTheMap.Web/.env

# Bu string'leri arayıp değiştirin:
# "your-super-secret-key-that-is-at-least-256-bits-long-for-development"
# "admin" / "password" credential çiftleri (AuthService.cs'deki)
```

---

## 🔍 History'de Hassas Bilgileri Bulma

```bash
# Belirli bir dosyanın geçmişini kontrol et
git log --all --full-history -- HeatTheMap.Api/appsettings.Development.json

# Belirli bir string'i ara
git log -S "your-super-secret-key" --all --oneline

# Tüm commit'lerde bir pattern ara
git grep "password.*=" $(git rev-list --all)
```

---

## ✅ Temizlik Sonrası Kontrol

```bash
# 1. Dosyanın history'de olmadığını doğrula
git log --all --full-history -- HeatTheMap.Api/appsettings.Development.json
# Sonuç: boş olmalı

# 2. Secret string'in olmadığını doğrula
git log -S "your-super-secret-key" --all
# Sonuç: boş olmalı

# 3. Repository boyutunu kontrol et
git count-objects -vH
```

---

## 👥 Takım İçin Talimatlar

History temizliği yaptıktan sonra, diğer geliştiricilere gönderin:

```bash
# Eski clone'u silin
cd ..
rm -rf heatTheMap

# Yeniden klonlayın
git clone https://github.com/xhyazgan/heatTheMap.git
cd heatTheMap

# Kendi configuration dosyalarınızı oluşturun
cp HeatTheMap.Api/appsettings.Development.json.example HeatTheMap.Api/appsettings.Development.json
cp HeatTheMap.Web/.env.example HeatTheMap.Web/.env
# Dosyaları düzenleyin...
```

---

## 🔒 Hassas Bilgiler İnternette Paylaşıldıysa

Eğer repo zaten public ise veya bir süre public kaldıysa:

1. **Tüm secret'ları değiştirin**
   - JWT key'i yeni bir değer ile değiştirin
   - Tüm şifreleri değiştirin
   - API key'leri rotate edin

2. **GitHub'a bildir** (eğer GitHub kullanıyorsanız)
   ```
   Settings -> Security -> Report a vulnerability
   ```

3. **Credential rotation**
   - Production'daki tüm credential'ları yenileyin
   - Database şifrelerini değiştirin
   - API token'larını iptal edip yenilerini oluşturun

---

## 🎬 Hızlı Başlangıç (BFG ile)

```bash
# 1. BFG indir
# https://rtyley.github.io/bfg-repo-cleaner/

# 2. Bu komutları çalıştır
cd c:\Users\yazga\heatTheMap

# 3. Silinecek dosyaları listele
echo HeatTheMap.Api/appsettings.Development.json > files-to-delete.txt
echo HeatTheMap.Web/.env >> files-to-delete.txt

# 4. BFG ile temizle
java -jar bfg.jar --delete-files appsettings.Development.json
java -jar bfg.jar --delete-files .env

# 5. Git'i temizle ve push et
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force --all

# 6. Kontrol et
git log --all --full-history -- HeatTheMap.Api/appsettings.Development.json
```

---

## 💡 En İyi Pratikler

1. **Pre-commit hooks kullanın**: Hassas bilgilerin commit edilmesini engelleyin
2. **Secret scanning**: GitHub'ın secret scanning özelliğini aktifleştirin
3. **Environment variables**: Production'da mutlaka environment variable kullanın
4. **.gitignore**: Hassas dosyaları mutlaka ekleyin (✅ Bunu yaptınız)
5. **Code review**: Pull request'lerde hassas bilgi kontrolü yapın

---

## 📚 Kaynaklar

- BFG Repo-Cleaner: https://rtyley.github.io/bfg-repo-cleaner/
- git-filter-repo: https://github.com/newren/git-filter-repo
- GitHub Docs: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
