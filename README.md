### Projenin amacı
----------------------------------------
 Bu projenin amacı, NASA batarya verisi üzerinde SoC (State of Charge) tahminleri yapmaktır. Proje kapsamında veriler tamamen temizlenmiş, özellik çıkarımı ve keşifsel veri analizi (EDA) gerçekleştirilmiş, farklı yapay sinir ağı modelleri (FFN, LSTM, BiLSTM, GRU) ile model eğitimi ve değerlendirme yapılmıştır. Eğitilen modeller kaydedilmiş, yeniden kullanılabilir hâle getirilmiş ve FastAPI kullanılarak Docker tabanlı bir servis oluşturulmuştur. Ayrıca React tabanlı bir web arayüz ile tahmin sonuçları görselleştirilmiş ve kullanıcı dostu bir demo hazırlanmıştır. Böylece veri hazırlamadan model dağıtımına kadar uçtan uca bir pipeline oluşturularak projenin çoğaltılabilir ve tekrar üretilebilir olması sağlanmıştır.


### Dosya yapısı
----------------------------------------
```
nasa-battery-soc/
│
├── api/
│   ├── get_data.py          # postgresql'den veri getirme işlemi
│   └── upload.py            # ui'da json dosyası yükleme işlemi
│
├── data/
│   ├── cleaned_dataset/
│   ├── model_data/          # train_df.csv test_df.csv
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
│   ├── model/                # .pth model dosyaları
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

###### Step 1: Repoyu clonelayın

```bash
git clone https://github.com/lvntaslann/nasa-battery-soc
```

###### Step 2: Terminalde proje dosya yoluna girin
```bash
cd nasa-battery-soc
```
Projeyi çalıştırmak için öncelikle terminalinizde ortam değişkenlerini ayarlayın, ardından Docker Compose kullanarak uygulamayı başlatın

###### Step 3: PowerShell'de ortam değişkenlerini dilediğiniz gibi ayarlayın (bu komutları tek tek çalıştırın)

```powershell
$env:POSTGRES_USER="benimuser"
$env:POSTGRES_PASSWORD="benimsecret"
$env:PGADMIN_DEFAULT_PASSWORD="admin123"
```
###### Step 4: Uygulamayı Docker Compose ile başlatın
```bash
docker-compose up --build
```

###### Step 5: Web tarayıcısında aşağıdaki portlar üzerinden görüntüleyin
```
backend    : localhost:8000
react ui   : localhost:5173
postgresql : localhost:5432
pgadmin    : localhost:8080
```

###### Step 6: Servis oluşturarak veritabanı detaylarını görüntülemek için (belirlediğiniz parametreler ile giriş yapabilirsiniz)

| ![Image 1](/assets/pgadmin-image-1.png) | ![Image 2](/assets/pgadmin-image-2.png) |
|----------------------------------------|----------------------------------------|


### Demo uygulama arayüzü
----------------------------------------
<img src="/assets/ui-image-1.png" alt="Uygulama Tasarımı" width="850" style="display: block; margin: auto;" />
<img src="/assets/ui-image-2.png" alt="Uygulama Tasarımı" width="850" style="display: block; margin: auto;" /> 
<img src="/assets/ui-image-3.png" alt="Uygulama Tasarımı" width="850" style="display: block; margin: auto;" />
<img src="/assets/ui-image-4.png" alt="Uygulama Tasarımı" width="850" style="display: block; margin: auto;" />


### Model sonuçları
----------------------------------------

|       Model       |        MSE        |        MAE        |       RMSE       |        R²        |   Training Time (s)   |
|:-----------------:|:----------------:|:----------------:|:----------------:|:----------------:|:-------------------:|
|       FFN         |     0.00047      |     0.00704      |     0.02177      |     0.90277      |      502.89106       |
|      LSTM         |     0.00024      |     0.00351      |     0.01561      |      0.95        |      801.59717       |
|     BiLSTM        |     0.00040      |     0.00488      |     0.02012      |     0.91693      |      970.40744       |
|       GRU         |     0.00031      |     0.00438      |     0.01748      |     0.93732      |      677.63637       |
