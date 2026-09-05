import React, { useEffect, useState } from 'react';
import styles from './Create.module.css';
import { TbCameraPlus } from "react-icons/tb";
import { LiaMapMarkerAltSolid } from "react-icons/lia";
import { IoMdCheckmark } from "react-icons/io";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { useProgram } from "../solana.js";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

// ✅ ИСПРАВЛЕНИЕ №3: Полифилл Buffer для Vite
import { Buffer } from 'buffer';
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

const AGENT_URL = import.meta.env.VITE_AGENT_URL || "http://localhost:8000";

const Create = () => {
  const [file, setFile] = useState(null);
  const[preview, setPreview] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [address, setAddress] = useState("Выберите точку на карте");
  const [mapShow, setMapShow] = useState(false);
  const [notImage, setNotImage] = useState(false);
  const[notLocation, setNotLocation] = useState(false);
  const [sending, setSending] = useState(false);

  const navigate = useNavigate();
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const { program } = useProgram();

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const goBack = () => navigate(-1);

  async function getAddress(lat, lng) {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await res.json();
    return data.display_name;
  }

  const ClickHandler = () => {
    useMapEvents({
      async click(e) {
        const { lat, lng } = e.latlng;
        setMarkerPosition([lat, lng]);
        const addr = await getAddress(lat, lng);
        setAddress(addr);
      }
    });
    return null;
  };

  const customIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [32, 32],
  });

  const sendProblem = async () => {
    if (!file) return setNotImage(true);
    if (!markerPosition) return setNotLocation(true);
    if (!program || !publicKey) return alert("Подключите Phantom кошелёк!");

    setSending(true);
    try {
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.readAsDataURL(file);
      });

      const imgForm = new FormData();
      imgForm.append("image", base64);

      const uploadRes = await fetch(
        `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_KEY}`,
        { method: "POST", body: imgForm }
      );
      if (!uploadRes.ok) throw new Error("Ошибка загрузки фото");
      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.data.url;
      console.log("📸 Фото загружено:", imageUrl);

      const analyzeForm = new FormData();
      analyzeForm.append("image_url", imageUrl);

      const analyzeRes = await fetch(`${AGENT_URL}/analyze`, {
        method: "POST",
        body: analyzeForm,
      });
      const aiResult = await analyzeRes.json();

      if (!aiResult.ok) {
        alert(`❌ ИИ отклонил фото:\n${aiResult.error}`);
        setSending(false);
        return;
      }

      console.log(`🤖 ИИ одобрил! severity=${aiResult.severity} cost=${aiResult.estimated_cost}`);

      const issueId = new BN(Date.now());
      const[issuePda] = PublicKey.findProgramAddressSync([Buffer.from("issue"), issueId.toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      const combinedUrl = `${imageUrl}|${markerPosition[0]}|${markerPosition[1]}`;
      if (combinedUrl.length > 256) throw new Error("URL слишком длинный!");

      const tx = await program.methods
        .createIssue(issueId, combinedUrl)
        .accounts({
          issue:         issuePda,
          creator:       publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("⏳ Транзакция отправлена, ждем подтверждения сети...", tx);

      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: tx
      });

      console.log("✅ Транзакция подтверждена! Вызываем ИИ для verify...");

      const verifyForm = new FormData();
      verifyForm.append("issue_pda",      issuePda.toString());
      verifyForm.append("severity",       aiResult.severity);
      verifyForm.append("estimated_cost", aiResult.estimated_cost);

      const verifyRes = await fetch(`${AGENT_URL}/verify`, {
        method: "POST",
        body: verifyForm,
      });
      const verifyResult = await verifyRes.json();

      if (!verifyResult.ok) {
        console.warn("⚠️ verifyByAi не прошёл:", verifyResult.error);
        alert(`Проблема создана, но ИИ не смог её подтвердить: ${verifyResult.error}`);
      } else {
        alert(`✅ Проблема успешно отправлена и подтверждена ИИ!\nОпасность: ${aiResult.severity}/10\nСтоимость ремонта: $${aiResult.estimated_cost}`);
      }
      
      navigate('/');

    } catch (err) {
      console.error(err);
      alert(`Ошибка: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
        () => setUserPosition([43.238949, 76.889709])
      );
    } else {
      setUserPosition([43.238949, 76.889709]);
    }
  },[]);

  useEffect(() => { if (notImage) setNotImage(false); }, [file]);
  useEffect(() => { if (notLocation) setNotLocation(false); }, [markerPosition]);

  if (!connected || !program || !publicKey) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Подключите Phantom кошелёк</p>
        <WalletMultiButton />
      </div>
    );
  }

  if (!userPosition) return <p>Загружаем карту...</p>;

  return (
    <div className={styles.create} onClick={goBack}>
      <div className={styles.createModal} onClick={e => e.stopPropagation()}>
        <h3>Зафиксировать проблему</h3>

        <div
          className={`${styles.photoFile} ${preview ? styles.hiddenText : ''} ${notImage ? styles.notImage : ''}`}
          style={{ backgroundImage: preview ? `url(${preview})` : 'none' }}
        >
          <TbCameraPlus />
          <p>Сделайте фото или загрузите</p>
          <input type="file" className={styles.photoInput} onChange={handleFileChange} accept="image/*" capture="environment" />
        </div>

        <div className={styles.selectLocation}>
          <label className={styles.locationLeft}>
            Выберите локацию
            <button
              onClick={() => setMapShow(true)}
              className={`${styles.locationBtn} ${notLocation ? styles.notLocation : ''}`}
            >
              <LiaMapMarkerAltSolid />
              <span className={styles.addressText}>{address}</span>
              <span className={styles.gpsText}><IoMdCheckmark />GPS</span>
            </button>
          </label>
          <div className={styles.mapSection}>
            {!mapShow && (
              <MapContainer center={markerPosition || userPosition} zoom={15} className={styles.map}>
                <TileLayer attribution='© OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              </MapContainer>
            )}
            <button className={styles.showMap} onClick={() => setMapShow(true)} />
          </div>
        </div>

        <button
          className={styles.createBtn}
          onClick={sendProblem}
          disabled={sending}
        >
          {sending
            ? '⏳ Обработка транзакции...'
            : <>Отправить на проверку <img src="./Phantom-Icon.svg" alt="" /></>
          }
        </button>
      </div>

      {mapShow && (
        <div className={styles.mapDiv} onClick={e => e.stopPropagation()}>
          <button onClick={() => setMapShow(false)} className={styles.closeMap}><RxCross1 /></button>
          <MapContainer center={userPosition} zoom={16} className={styles.bigMap}>
            <TileLayer attribution='© OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ClickHandler />
            {markerPosition && (
              <Marker position={markerPosition} icon={customIcon}>
                <Popup>{address} {markerPosition[0].toFixed(5)}, {markerPosition[1].toFixed(5)}</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default Create;