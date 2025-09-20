### Projenin amacı
----------------------------------------
Bu projenin amacı, NASA batarya verisi üzerinde geçmiş verilerden özellik çıkarımı yaparak SoC (State of Charge) ile gelecekteki SoC tahminlerini gerçekleştirmektir. Proje kapsamında veriler tamamen temizlenmiş, özellik çıkarımı ve keşifsel veri analizi (EDA) gerçekleştirilmiş, farklı yapay sinir ağı modelleri (FFN, LSTM, BiLSTM, GRU) ile model eğitimi ve değerlendirme yapılmıştır. Eğitilen modeller kaydedilmiş, yeniden kullanılabilir hâle getirilmiş ve FastAPI kullanılarak Docker tabanlı bir servis oluşturulmuştur.

Sistem, verilerin güvenli şekilde saklanması için PostgreSQL veritabanı ile entegre edilmiş, anlık veri iletimi ve cihaz mesajlaşmasını test verisi ile simüle edebilmek için MQTT broker kullanılmıştır. Ayrıca React tabanlı bir web arayüz ile tahmin sonuçları görselleştirilmiş ve kullanıcı dostu bir demo hazırlanmıştır. Böylece veri hazırlamadan model dağıtımına kadar uçtan uca bir pipeline oluşturularak, projenin çoğaltılabilir ve tekrar üretilebilir olması sağlanmıştır.


### Demo Video
----------------------------------------
#### Drive linki: [Demo Video](https://drive.google.com/file/d/1Srd0MA-K9hY3d4nE69sceNtp2YEYU8hC/view?usp=sharing)



### Dosya Yapısı
----------------------------------------

```
nasa-battery-soc/
│
├── api/
│   ├── get_data.py          # PostgreSQL'den veri getirme işlemi
│   ├── upload.py            # UI'da JSON dosyası yükleme işlemi
│   └── mqtt_predict.py      # MQTT ile test verisi gönderme ve anlık tahmin alma
│
├── data/
│   ├── cleaned_dataset/
│   ├── model_data/          # train_df.csv ve test_df.csv
│   ├── metadata.csv         # cleaned_dataset detayları
│   └── combined_df.csv
│
├── db/
│   ├── db_services.py       # get ve save işlemleri
│   ├── db.py                # veritabanı bağlantısı ve konfigürasyon
│   ├── models.py            # SQLAlchemy modelleri
│   └── schemas.py           # Pydantic şemaları
│
├── docker/
│   ├── Dockerfile.backend   # backendi ayağa kaldırmak için
│   └── Dockerfile.ui        # UI'i ayağa kaldırmak için
│
├── models/
│   ├── bilstm_model.py   
│   ├── ffn_model.py
│   ├── gru_model.py
│   └── lstm_model.py
│
├── notebook/
│   ├── exploratory_data_analysis.ipynb
│   ├── preparing_data_for_analysis.ipynb
│   └── preparing_data_for_training.ipynb
│
├── result/
│   ├── model/               # .pth model dosyaları
│   └── scores.json
│
├── scripts/
│   ├── prepare_metadata.py
│   └── prepare_model_data.py
│
├── services/
│   └── model_service.py
│
├── ui/                       # React + Vite frontend
│
├── utils/
│   ├── data_processing_for_analysis.py
│   ├── data_processing_for_train.py
│   ├── data_utils.py
│   ├── evaluate.py
│   └── train.py
│
├── config.py
├── docker-compose.yml
├── main.py
└── requirements.txt
```

### Projeyi Çalıştırmak için
----------------------------------------

#### Step 1: Repoyu clonelayın

```bash
git clone https://github.com/lvntaslann/nasa-battery-soc
```

#### Step 2: Terminalde proje dosya yoluna girin
```bash
cd nasa-battery-soc
```
Projeyi çalıştırmak için öncelikle terminalinizde ortam değişkenlerini ayarlayın, ardından Docker Compose kullanarak uygulamayı başlatın

Windowsta docker desktop, Linuxta docker kurulu değilse yüklemeyi unutmayın
#### Step 3: Windows PowerShell'de veya Linux Terminalde ortam değişkenlerini dilediğiniz gibi ayarlayın (bu komutları tek tek çalıştırın)


#### PostgreSQL girdileri
##### Zorunlu olarak girilmesi gerekiyor
###### pgadminde default email admin@admin.com
Windows Powershell
```powershell
$env:POSTGRES_DB="mydatabase"
$env:POSTGRES_USER="myuser"
$env:POSTGRES_PASSWORD="mydbpassword"
$env:PGADMIN_DEFAULT_PASSWORD="mypgadminpassword"
```
Linux terminal
```bash
export POSTGRES_DB="mydatabase"
export POSTGRES_USER="myuser"
export POSTGRES_PASSWORD="mydbpassword"
export PGADMIN_DEFAULT_PASSWORD="mypgadminpassword"
```

#### Tekrar eğitim yapılacaksa parametre girdileri
###### Yapılmayacaksa :  default olarak eğitilmiş LSTM modeli kullanılıyor
Eğitilebilecek model seçenekleri
MODEL_TYPE = ["ffn","lstm","bilstm","gru"]

Windows Powershell
```powershell
$env:MODEL_TYPE="ffn"
$env:EPOCHS="10"
$env:BATCH_SIZE="128"
$env:LR="0.001"
$env:TRAIN_MODEL="True"
$env:SEQ_LEN="30"
```
Linux terminal
```bash
export MODEL_TYPE="ffn"
export EPOCHS="10"
export BATCH_SIZE="128"
export LR="0.001"
export TRAIN_MODEL="True"
export SEQ_LEN="30"
```

#### Step 4: Uygulamayı Docker Compose ile başlatın
```bash
docker-compose up --build
```

#### Step 5: Web tarayıcısında aşağıdaki portlar üzerinden görüntüleyin
```
backend    : localhost:8000/docs
react ui   : localhost:5173
pgadmin    : localhost:8080
```

#### Step 6: Servis oluşturarak veritabanı detaylarını görüntülemek için (belirlediğiniz parametreler ile giriş yapabilirsiniz)

| ![Image 1](/assets/pgadmin-image-1.png) | ![Image 2](/assets/pgadmin-image-2.png) |
|----------------------------------------|----------------------------------------|


### Demo uygulama arayüzü
----------------------------------------
<img src="/assets/ui-image-1.png" alt="Uygulama Tasarımı" width="850" style="display: block; margin: auto;" />
<img src="/assets/ui-image-2.png" alt="Uygulama Tasarımı" width="850" style="display: block; margin: auto;" /> 
<img src="/assets/ui-image-3.png" alt="Uygulama Tasarımı" width="850" style="display: block; margin: auto;" />
<img src="/assets/ui-image-4.png" alt="Uygulama Tasarımı" width="850" style="display: block; margin: auto;" />


### Model Sonuçları

| Model   | MSE       | MAE       | RMSE      | R²       | Training Time (s) |
|:-------:|:---------:|:---------:|:---------:|:--------:|:----------------:|
| FFN     | 9.00e-05  | 2.36e-03  | 9.48e-03  | 0.9816   | 500.8786         |
| LSTM    | 2.30e-04  | 5.90e-04  | 2.08e-03  | 0.9991   | 782.1539         |
| BiLSTM  | 1.20e-04  | 5.10e-04  | 2.14e-03  | 0.9991   | 956.1968         |
| GRU     | 2.80e-04  | 2.10e-04  | 9.80e-04  | 0.9998   | 687.0017         |

