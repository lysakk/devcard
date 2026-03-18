// app/(tabs)/index.tsx
// DevCard — Yazılımcı Kimlik Kartı
// Challenge 3 + 4 | React Native + Expo Router + TypeScript

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
  StatusBar,
} from 'react-native';

// ─── TİPLER ──────────────────────────────────────────────────
type Seviye = 'Junior' | 'Mid' | 'Senior' | 'Principal';

interface SeviyeData {
  renk: string;
  puan: number;
  sonraki: number;
  emoji: string;
}

interface Basarim {
  id: string;
  emoji: string;
  baslik: string;
  aciklama: string;
  kilit: boolean;
}

interface KimlikKartiProps {
  ad: string;
  uzmanlik: string;
  github: string;
  sehir: string;
}

// ─── SABİTLER ────────────────────────────────────────────────
const SEVIYELER: Record<Seviye, SeviyeData> = {
  Junior:    { renk: '#4ADE80', puan: 0,   sonraki: 100,      emoji: '🌱' },
  Mid:       { renk: '#FACC15', puan: 100, sonraki: 300,      emoji: '⚡' },
  Senior:    { renk: '#F97316', puan: 300, sonraki: 700,      emoji: '🔥' },
  Principal: { renk: '#A78BFA', puan: 700, sonraki: Infinity, emoji: '👑' },
};

const BASARIMLAR: Basarim[] = [
  { id: 'ilk_is',   emoji: '🎯', baslik: 'İlk İş!',       aciklama: 'İlk kez işe alındın',          kilit: false },
  { id: 'populer',  emoji: '⭐', baslik: 'Popüler Dev',   aciklama: '3 kez işe alındın',            kilit: true  },
  { id: 'senior',   emoji: '🏆', baslik: 'Senior Oldu!',  aciklama: 'Senior seviyesine ulaştın',    kilit: true  },
  { id: 'principal',emoji: '👑', baslik: 'Principal!',    aciklama: 'En yüksek seviyeye ulaştın',   kilit: true  },
];

// ─── YARDIMCI FONKSİYONLAR ───────────────────────────────────
const mevcutSeviyeHesapla = (puan: number): Seviye => {
  if (puan >= 700) return 'Principal';
  if (puan >= 300) return 'Senior';
  if (puan >= 100) return 'Mid';
  return 'Junior';
};

// ─── XP İLERLEME ÇUBUĞU ─────────────────────────────────────
const XPBar = ({ puan, seviye }: { puan: number; seviye: Seviye }) => {
  const seviyeData = SEVIYELER[seviye];
  const oncekiPuan: Record<Seviye, number> = { Junior: 0, Mid: 100, Senior: 300, Principal: 700 };
  const baslangic = oncekiPuan[seviye];
  const bitis = seviyeData.sonraki === Infinity ? 700 : seviyeData.sonraki;
  const yuzde = seviyeData.sonraki === Infinity
    ? 100
    : Math.min(((puan - baslangic) / (bitis - baslangic)) * 100, 100);

  return (
    <View style={styles.xpKonteyner}>
      <View style={styles.xpUstSatir}>
        <Text style={styles.xpMetin}>XP: {puan}</Text>
        <Text style={styles.xpMetin}>
          {seviyeData.sonraki === Infinity ? 'MAX SEVİYE 👑' : `Sonraki: ${bitis} XP`}
        </Text>
      </View>
      <View style={styles.xpArkaplan}>
        <View style={[styles.xpDolgu, { width: `${yuzde}%` as any, backgroundColor: seviyeData.renk }]} />
      </View>
    </View>
  );
};

// ─── ROZET BİLEŞENİ ──────────────────────────────────────────
const Rozet = ({ basarim, kazanildi }: { basarim: Basarim; kazanildi: boolean }) => (
  <View style={[styles.rozetKart, !kazanildi && styles.rozetKilitli]}>
    <Text style={styles.rozetEmoji}>{kazanildi ? basarim.emoji : '🔒'}</Text>
    <Text style={[styles.rozetBaslik, !kazanildi && styles.rozetKilitliMetin]}>
      {kazanildi ? basarim.baslik : '???'}
    </Text>
    <Text style={styles.rozetAciklama}>{kazanildi ? basarim.aciklama : 'Kilidi kır!'}</Text>
  </View>
);

// ─── ANA KİMLİK KARTI BİLEŞENİ ───────────────────────────────
const KimlikKarti = ({ ad, uzmanlik, github, sehir }: KimlikKartiProps) => {
  const [musaitMi, setMusaitMi] = useState<boolean>(true);
  const [puan, setPuan] = useState<number>(0);
  const [isSayisi, setIsSayisi] = useState<number>(0);
  const [kazanilanRozetler, setKazanilanRozetler] = useState<string[]>([]);
  const [aktifSekme, setAktifSekme] = useState<'profil' | 'rozetler'>('profil');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const mevcutSeviye = mevcutSeviyeHesapla(puan);
  const seviyeData = SEVIYELER[mevcutSeviye];

  const pulseBaslat = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.08, duration: 120, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1,    duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const rozetKontrol = (yeniPuan: number, yeniIsSayisi: number, yeniSeviye: Seviye) => {
    const yeniRozetler = [...kazanilanRozetler];
    let degisti = false;

    const ekle = (id: string, mesaj: string) => {
      if (!yeniRozetler.includes(id)) {
        yeniRozetler.push(id);
        degisti = true;
        Alert.alert('🎉 Yeni Rozet!', mesaj);
      }
    };

    if (yeniIsSayisi >= 1)              ekle('ilk_is',    'İlk İş rozetini kazandın!');
    if (yeniIsSayisi >= 3)              ekle('populer',   'Popüler Dev rozetini kazandın!');
    if (yeniSeviye === 'Senior')        ekle('senior',    'Senior seviyesine ulaştın! 🏆');
    if (yeniSeviye === 'Principal')     ekle('principal', 'Principal! En tepe! 👑');

    if (degisti) setKazanilanRozetler(yeniRozetler);
  };

  const iseAlHandler = () => {
    if (!musaitMi) return;
    pulseBaslat();
    const kazanilanXP = 50 + Math.floor(Math.random() * 51);
    const yeniPuan = puan + kazanilanXP;
    const yeniIsSayisi = isSayisi + 1;
    const yeniSeviye = mevcutSeviyeHesapla(yeniPuan);
    setPuan(yeniPuan);
    setIsSayisi(yeniIsSayisi);
    setMusaitMi(false);
    rozetKontrol(yeniPuan, yeniIsSayisi, yeniSeviye);
  };

  return (
    <View style={styles.kartKonteyner}>
      {/* Üst Renkli Bant */}
      <View style={[styles.kartBant, { backgroundColor: seviyeData.renk }]}>
        <Text style={styles.bantMetin}>{seviyeData.emoji} {mevcutSeviye} Developer</Text>
        <Text style={styles.bantIsSayisi}>💼 {isSayisi} proje</Text>
      </View>

      {/* Avatar & İsim */}
      <View style={styles.profilAlani}>
        <Animated.View style={[
          styles.avatarDaire,
          { transform: [{ scale: pulseAnim }], borderColor: seviyeData.renk }
        ]}>
          <Text style={[styles.avatarHarf, { color: seviyeData.renk }]}>
            {ad.charAt(0).toUpperCase()}
          </Text>
        </Animated.View>
        <View style={styles.profilBilgi}>
          <Text style={styles.adMetin}>{ad}</Text>
          <Text style={styles.uzmanlikMetin}>{uzmanlik}</Text>
          <Text style={styles.sehirMetin}>📍 {sehir}</Text>
        </View>
      </View>

      {/* XP Bar */}
      <XPBar puan={puan} seviye={mevcutSeviye} />

      {/* Sekmeler */}
      <View style={styles.sekmeBar}>
        {(['profil', 'rozetler'] as const).map((sekme) => (
          <TouchableOpacity
            key={sekme}
            style={[styles.sekme, aktifSekme === sekme && { borderBottomColor: seviyeData.renk, borderBottomWidth: 2 }]}
            onPress={() => setAktifSekme(sekme)}
          >
            <Text style={[styles.sekmeMetin, aktifSekme === sekme && { color: seviyeData.renk }]}>
              {sekme === 'profil' ? '👤 Profil' : '🏅 Rozetler'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sekme İçeriği */}
      {aktifSekme === 'profil' ? (
        <View style={styles.profilDetay}>
          {[
            { etiket: 'GitHub',  deger: `@${github}` },
            { etiket: 'Durum',   deger: musaitMi ? '🟢 Müsait' : '🔴 Projelerde Çalışıyor' },
            { etiket: 'Proje',   deger: `${isSayisi} tamamlandı 🚀` },
            { etiket: 'Toplam XP', deger: `${puan} XP` },
          ].map(({ etiket, deger }) => (
            <View key={etiket} style={styles.detayKart}>
              <Text style={styles.detayEtiket}>{etiket}</Text>
              <Text style={styles.detayDeger}>{deger}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.rozetGrid}>
          {BASARIMLAR.map((b) => (
            <Rozet key={b.id} basarim={b} kazanildi={kazanilanRozetler.includes(b.id)} />
          ))}
        </View>
      )}

      {/* Butonlar */}
      <View style={styles.butonGrup}>
        <TouchableOpacity
          style={[styles.iseAlButon, { backgroundColor: musaitMi ? seviyeData.renk : '#334155' }]}
          onPress={iseAlHandler}
          disabled={!musaitMi}
        >
          <Text style={styles.iseAlButonMetin}>
            {musaitMi ? `🤝 İşe Al  (+50~100 XP)` : '⏳ Projelerde Çalışıyor'}
          </Text>
        </TouchableOpacity>

        {!musaitMi && (
          <TouchableOpacity style={styles.musaitOlButon} onPress={() => setMusaitMi(true)}>
            <Text style={styles.musaitOlButonMetin}>✅ Projeyi Bitir & Müsait Ol</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ─── ANA EKRAN ────────────────────────────────────────────────
export default function HomeScreen() {
  return (
    <ScrollView style={styles.ekran} contentContainerStyle={styles.ekranIcerik}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <Text style={styles.baslik}>{'</DevCard>'}</Text>
      <Text style={styles.altBaslik}>Yazılımcı Kimlik Kartı</Text>
      <KimlikKarti
        ad="Adın Soyadın"
        uzmanlik="React Native Developer"
        github="kullaniciad"
        sehir="İstanbul, TR"
      />
    </ScrollView>
  );
}

// ─── STİLLER ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  ekran:         { flex: 1, backgroundColor: '#0F172A' },
  ekranIcerik:   { padding: 20, paddingTop: 60, alignItems: 'center' },
  baslik:        { fontSize: 28, fontWeight: '800', color: '#F8FAFC', letterSpacing: 1 },
  altBaslik:     { fontSize: 13, color: '#64748B', marginBottom: 28, marginTop: 4 },

  kartKonteyner: {
    width: '100%', backgroundColor: '#1E293B',
    borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 20, elevation: 10,
  },
  kartBant:      { flexDirection: 'row', justifyContent: 'space-between', padding: 10, paddingHorizontal: 16 },
  bantMetin:     { color: '#0F172A', fontWeight: '700', fontSize: 13 },
  bantIsSayisi:  { color: '#0F172A', fontWeight: '600', fontSize: 13 },

  profilAlani:   { flexDirection: 'row', padding: 20, alignItems: 'center' },
  avatarDaire:   {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, backgroundColor: '#0F172A',
  },
  avatarHarf:    { fontSize: 32, fontWeight: '800' },
  profilBilgi:   { marginLeft: 16, flex: 1 },
  adMetin:       { fontSize: 20, fontWeight: '800', color: '#F8FAFC' },
  uzmanlikMetin: { fontSize: 14, color: '#94A3B8', marginTop: 2 },
  sehirMetin:    { fontSize: 12, color: '#64748B', marginTop: 4 },

  xpKonteyner:   { paddingHorizontal: 20, paddingBottom: 16 },
  xpUstSatir:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  xpMetin:       { fontSize: 12, color: '#94A3B8' },
  xpArkaplan:    { height: 8, backgroundColor: '#334155', borderRadius: 4, overflow: 'hidden' },
  xpDolgu:       { height: '100%', borderRadius: 4 },

  sekmeBar:      { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#334155' },
  sekme:         { flex: 1, paddingVertical: 12, alignItems: 'center' },
  sekmeMetin:    { fontSize: 13, color: '#64748B', fontWeight: '600' },

  profilDetay:   { padding: 16, gap: 10 },
  detayKart:     {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: '#0F172A', borderRadius: 10, padding: 12,
  },
  detayEtiket:   { fontSize: 13, color: '#64748B' },
  detayDeger:    { fontSize: 13, color: '#F8FAFC', fontWeight: '600' },

  rozetGrid:     { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 10 },
  rozetKart:     {
    width: '47%', backgroundColor: '#0F172A',
    borderRadius: 12, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#334155',
  },
  rozetKilitli:      { opacity: 0.4 },
  rozetEmoji:        { fontSize: 28, marginBottom: 4 },
  rozetBaslik:       { fontSize: 12, color: '#F8FAFC', fontWeight: '700', textAlign: 'center' },
  rozetAciklama:     { fontSize: 10, color: '#64748B', textAlign: 'center', marginTop: 2 },
  rozetKilitliMetin: { color: '#64748B' },

  butonGrup:         { padding: 16, gap: 10 },
  iseAlButon:        { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  iseAlButonMetin:   { color: '#0F172A', fontWeight: '800', fontSize: 15 },
  musaitOlButon:     {
    backgroundColor: '#0F172A', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#4ADE80',
  },
  musaitOlButonMetin: { color: '#4ADE80', fontWeight: '700', fontSize: 14 },
});