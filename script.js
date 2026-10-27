const STORAGE_KEY = "vcare-vanilla-data-v2";
const SESSION_KEY = "vcare-vanilla-session";

function getInitialData() {
  return {
    users: [
      { id_user: 1, name: "Ammar Faiz", email: "user@vcare.com", password: "123", phone: "081234567890", role: "user" },
    ],
    vehicles: [
      { id: 101, owner_id: 1, name: "Honda Beat Street", plate: "BP 1234 XY", year: 2022, odometer: 15400, color: "#3d7165" },
      { id: 102, owner_id: 1, name: "Yamaha NMAX", plate: "BP 5678 AB", year: 2023, odometer: 8200, color: "#3d7165" }
    ],
    services: [
      { id: 201, vehicleId: 101, serviceType: "Ganti Oli", date: "2026-09-10", odometer: 14000, workshop: "AHASS Batam Center", cost: 65000, notes: "Ganti oli mesin rutin", status: "Selesai" },
      { id: 202, vehicleId: 101, serviceType: "Servis Berkala", date: "2026-10-25", odometer: 16000, workshop: "Bengkel Resmi Honda", cost: 120000, notes: "Servis berkala bulanan", status: "Terjadwal" }
    ],
    settings: { theme: "light" }
  };
}

function getState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  const initial = getInitialData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function showToast(msg) {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
}

function applyTheme() {
  const state = getState();
  document.body.classList.toggle("dark", state.settings?.theme === "dark");
}

applyTheme();

// Setup Topbar Header & Notifikasi Pintar (Logika H-3)
function setupTopbarHeader() {
  const currentUserId = Number(localStorage.getItem(SESSION_KEY));
  if (!currentUserId) return;

  const state = getState();
  const user = state.users.find(u => u.id_user === currentUserId);

  if (user) {
    const avatarEl = document.querySelector("#userAvatar");
    const nameEl = document.querySelector("#userNameTop");
    if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
    if (nameEl) nameEl.textContent = user.name.split(" ")[0];
  }

  const myVehicleIds = state.vehicles.filter(v => v.owner_id === currentUserId).map(v => v.id);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const hasH3Service = state.services.some(s => {
    if (!myVehicleIds.includes(s.vehicleId) || s.status !== "Terjadwal") return false;
    const serviceDate = new Date(s.date);
    serviceDate.setHours(0, 0, 0, 0);
    const diffTime = serviceDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  });

  const notifBadge = document.querySelector("#notifBadge");
  const notifBtn = document.querySelector("#notifBtn");

  if (notifBadge && hasH3Service) {
    notifBadge.style.display = "grid";
  } else if (notifBadge) {
    notifBadge.style.display = "none";
  }

  if (notifBtn) {
    notifBtn.addEventListener("click", () => {
      window.location.href = "jadwal_servis.html";
    });
  }
}

setupTopbarHeader();

// 1. Auth, Register & Lupa Sandi (index.html)
const authForm = document.querySelector("#authForm");
if (authForm) {
  let isRegister = false;
  const toggleBtn = document.querySelector("#toggleModeBtn");
  const forgotPasswordBtn = document.querySelector("#forgotPasswordBtn"); // Pastikan variabel ini ada
  const registerFields = document.querySelector("#registerFields");
  const formTitle = document.querySelector("#formTitle");
  const submitBtn = document.querySelector("#submitBtn");

  toggleBtn.addEventListener("click", () => {
    isRegister = !isRegister;
    registerFields.style.display = isRegister ? "block" : "none";

    if (forgotPasswordBtn) {
      forgotPasswordBtn.style.display = isRegister ? "none" : "block";
    }

    formTitle.textContent = isRegister ? "Buat akun baru" : "Masuk ke akun";
    submitBtn.textContent = isRegister ? "Daftar Sekarang" : "Masuk";
    toggleBtn.textContent = isRegister ? "Sudah punya akun? Masuk di sini" : "Belum punya akun? Daftar di sini";
  });

  authForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const state = getState();
    const email = document.querySelector("#loginEmail").value.trim().toLowerCase();
    const password = document.querySelector("#loginPassword").value;

    if (isRegister) {
      const name = document.querySelector("#registerName").value.trim();
      const phone = document.querySelector("#registerPhone").value.trim();
      
      if (state.users.some(u => u.email.toLowerCase() === email)) {
        document.querySelector("#loginError").textContent = "Email sudah terdaftar!";
        return;
      }

      const newUser = { id_user: Date.now(), name, email, password, phone, role: "user" };
      state.users.push(newUser);
      saveState(state);
      localStorage.setItem(SESSION_KEY, String(newUser.id_user));
      window.location.href = "dashboard.html";
    } else {
      const user = state.users.find(u => u.email.toLowerCase() === email && u.password === password);
      if (user) {
        localStorage.setItem(SESSION_KEY, String(user.id_user));
        window.location.href = "dashboard.html";
      } else {
        document.querySelector("#loginError").textContent = "Email atau kata sandi salah!";
      }
    }
  });
}

// Logika Modal Lupa Kata Sandi (Terpisah agar aman)
const forgotPasswordBtn = document.querySelector("#forgotPasswordBtn");
const forgotModal = document.querySelector("#forgotModal");
const closeForgotModalBtn = document.querySelector("#closeForgotModalBtn");
const forgotForm = document.querySelector("#forgotForm");

if (forgotPasswordBtn && forgotModal) {
  forgotPasswordBtn.addEventListener("click", () => {
    forgotModal.style.display = "grid";
  });

  closeForgotModalBtn?.addEventListener("click", () => {
    forgotModal.style.display = "none";
  });

  // Tutup modal jika klik area luar modal
  forgotModal.addEventListener("click", (e) => {
    if (e.target === forgotModal) {
      forgotModal.style.display = "none";
    }
  });

  forgotForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.querySelector("#forgotEmail").value.trim().toLowerCase();
    const newPass = document.querySelector("#forgotNewPass").value;
    
    const state = getState();
    const user = state.users.find(u => u.email.toLowerCase() === email);

    if (user) {
      user.password = newPass;
      saveState(state);
      showToast("Kata sandi berhasil diubah! Silakan masuk.");
      forgotModal.style.display = "none";
      forgotForm.reset();
    } else {
      alert("Email tidak ditemukan dalam sistem!");
    }
  });
}

// 2. Logika Kendaraan Interaktif (kendaraan.html)
const vehicleContainer = document.querySelector("#vehicleContainer");
if (vehicleContainer) {
  const currentUserId = Number(localStorage.getItem(SESSION_KEY));
  const state = getState();
  const user = state.users.find(u => u.id_user === currentUserId);

  if (!user) {
    window.location.href = "index.html";
  }

  // Modal Edit Kendaraan
  const vehicleEditModal = document.querySelector("#vehicleEditModal");
  const closeVehicleEditModalBtn = document.querySelector("#closeVehicleEditModalBtn");

  if (closeVehicleEditModalBtn && vehicleEditModal) {
    closeVehicleEditModalBtn.addEventListener("click", () => {
      vehicleEditModal.style.display = "none";
    });
  }

  window.openVehicleEditModal = function(id) {
    const currentState = getState();
    const v = currentState.vehicles.find(item => item.id === id);
    if (!v) return;

    const editId = document.querySelector("#vEditId");
    const editName = document.querySelector("#vEditName");
    const editPlate = document.querySelector("#vEditPlate");
    const editYear = document.querySelector("#vEditYear");
    const editOdometer = document.querySelector("#vEditOdometer");

    if (editId) editId.value = v.id;
    if (editName) editName.value = v.name;
    if (editPlate) editPlate.value = v.plate;
    if (editYear) editYear.value = v.year;
    if (editOdometer) editOdometer.value = v.odometer;

    if (vehicleEditModal) vehicleEditModal.style.display = "grid";
  };

  const vehicleEditForm = document.querySelector("#vehicleEditForm");
  if (vehicleEditForm) {
    vehicleEditForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const currentState = getState();
      const id = Number(document.querySelector("#vEditId").value);
      const v = currentState.vehicles.find(item => item.id === id);

      if (v) {
        v.name = document.querySelector("#vEditName").value.trim();
        v.plate = document.querySelector("#vEditPlate").value.trim().toUpperCase();
        v.year = Number(document.querySelector("#vEditYear").value);
        v.odometer = Number(document.querySelector("#vEditOdometer").value);

        saveState(currentState);
        if (vehicleEditModal) vehicleEditModal.style.display = "none";
        showToast("Data kendaraan berhasil diperbarui!");
        renderVehicles();
        updateStatsGrid();
      }
    });
  }

  function renderVehicles() {
    vehicleContainer.innerHTML = "";
    const currentState = getState();
    const searchVal = (document.querySelector("#searchInput")?.value || "").toLowerCase();
    const myVehicles = currentState.vehicles.filter(v => v.owner_id === currentUserId && `${v.name} ${v.plate}`.toLowerCase().includes(searchVal));

    if (myVehicles.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "empty";
      emptyDiv.textContent = "Belum ada kendaraan. Tambahkan kendaraan pertama Anda.";
      vehicleContainer.appendChild(emptyDiv);
      return;
    }

    myVehicles.forEach(v => {
      const latestService = currentState.services
        .filter(s => s.vehicleId === v.id && s.status === "Selesai")
        .sort((a,b) => b.date.localeCompare(a.date))[0];

      const card = document.createElement("article");
      card.className = "vehicle-card";

      const head = document.createElement("div");
      head.className = "vehicle-head";

      const info = document.createElement("div");
      info.className = "vehicle-info";

      const icon = document.createElement("span");
      icon.className = "vehicle-icon";
      icon.style.background = v.color || "#3d7165";
      icon.innerHTML = '<i class="fa-solid fa-car"></i>';

      const textDiv = document.createElement("div");
      const h3 = document.createElement("h3");
      h3.textContent = v.name;
      const p = document.createElement("p");
      p.textContent = `${v.plate} · ${v.year}`;
      textDiv.appendChild(h3);
      textDiv.appendChild(p);

      info.appendChild(icon);
      info.appendChild(textDiv);

      const actions = document.createElement("div");
      actions.className = "actions";

      const editBtn = document.createElement("button");
      editBtn.className = "icon-button";
      editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
      editBtn.addEventListener("click", () => window.openVehicleEditModal(v.id));

      const delBtn = document.createElement("button");
      delBtn.className = "icon-button danger";
      delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
      delBtn.addEventListener("click", () => deleteVehicle(v.id));

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      head.appendChild(info);
      head.appendChild(actions);

      const meta = document.createElement("div");
      meta.className = "vehicle-meta";

      const box1 = document.createElement("div");
      box1.className = "meta-box";
      const span1 = document.createElement("span");
      span1.textContent = "Odometer";
      const strong1 = document.createElement("strong");
      strong1.textContent = `${Number(v.odometer).toLocaleString("id-ID")} km`;
      box1.appendChild(span1);
      box1.appendChild(strong1);

      const box2 = document.createElement("div");
      box2.className = "meta-box";
      const span2 = document.createElement("span");
      span2.textContent = "Servis terakhir";
      const strong2 = document.createElement("strong");
      strong2.textContent = latestService ? latestService.date : "Belum ada";
      box2.appendChild(span2);
      box2.appendChild(strong2);

      meta.appendChild(box1);
      meta.appendChild(box2);

      card.appendChild(head);
      card.appendChild(meta);
      vehicleContainer.appendChild(card);
    });
  }

  renderVehicles();
  document.querySelector("#searchInput")?.addEventListener("input", renderVehicles);

  const modal = document.querySelector("#vehicleModal");
  const openModalBtn = document.querySelector("#openAddVehicleModalBtn");
  const closeModalBtn = document.querySelector("#closeVehicleModalBtn");

  if (openModalBtn && modal) openModalBtn.addEventListener("click", () => modal.style.display = "grid");
  if (closeModalBtn && modal) closeModalBtn.addEventListener("click", () => modal.style.display = "none");

  const vehicleForm = document.querySelector("#vehicleForm");
  if (vehicleForm) {
    vehicleForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const currentState = getState();
      const newVehicle = {
        id: Date.now(),
        owner_id: currentUserId,
        name: document.querySelector("#vName").value.trim(),
        plate: document.querySelector("#vPlate").value.trim().toUpperCase(),
        year: Number(document.querySelector("#vYear").value),
        odometer: Number(document.querySelector("#vOdometer").value),
        color: "#3d7165"
      };
      currentState.vehicles.push(newVehicle);
      saveState(currentState);
      if (modal) modal.style.display = "none";
      vehicleForm.reset();
      showToast("Kendaraan berhasil ditambahkan.");
      renderVehicles();
      updateStatsGrid();
    });
  }
}

function deleteVehicle(id) {
  if (!confirm("Hapus kendaraan ini beserta riwayatnya?")) return;
  const currentState = getState();
  currentState.vehicles = currentState.vehicles.filter(v => v.id !== id);
  currentState.services = currentState.services.filter(s => s.vehicleId !== id);
  saveState(currentState);
  showToast("Kendaraan dihapus.");
  window.location.reload();
}

// 3. Logika Jadwal Servis (jadwal_servis.html)
const scheduleContainer = document.querySelector("#scheduleContainer");
if (scheduleContainer) {
  const currentUserId = Number(localStorage.getItem(SESSION_KEY));
  const state = getState();
  const myVehicles = state.vehicles.filter(v => v.owner_id === currentUserId);

  const selectVehicle = document.querySelector("#sVehicleId");
  if (selectVehicle) {
    selectVehicle.innerHTML = "";
    myVehicles.forEach(v => {
      const opt = document.createElement("option");
      opt.value = v.id;
      opt.textContent = `${v.name} — ${v.plate}`;
      selectVehicle.appendChild(opt);
    });
  }

  const editSelectVehicle = document.querySelector("#uEditVehicleId");
  if (editSelectVehicle) {
    editSelectVehicle.innerHTML = "";
    myVehicles.forEach(v => {
      const opt = document.createElement("option");
      opt.value = v.id;
      opt.textContent = `${v.name} — ${v.plate}`;
      editSelectVehicle.appendChild(opt);
    });
  }

  // Variabel penanda apakah modal sedang dalam mode konfirmasi selesai
  let isCompletingService = false;

  // Fungsi saat tombol "Selesai" diklik -> Membuka modal edit untuk konfirmasi akhir
  function openUserCompleteModal(serviceId) {
    const currentState = getState();
    const s = currentState.services.find(item => item.id === serviceId);
    if (!s) return;

    isCompletingService = true; // Tandai sedang konfirmasi selesai

    document.querySelector("#uEditServiceId").value = s.id;
    document.querySelector("#uEditVehicleId").value = s.vehicleId;
    document.querySelector("#uEditServiceType").value = s.serviceType || "";
    document.querySelector("#uEditDate").value = s.date;
    document.querySelector("#uEditOdometer").value = s.odometer;
    document.querySelector("#uEditWorkshop").value = s.workshop;
    document.querySelector("#uEditCost").value = s.cost;
    document.querySelector("#uEditNotes").value = s.notes || "";

    // Ubah judul modal agar sesuai (opsional, jika ingin memperjelas)
    const modalTitle = document.querySelector("#userEditServiceModal h2");
    if (modalTitle) modalTitle.textContent = "Konfirmasi & Selesaikan Servis";

    const userEditModal = document.querySelector("#userEditServiceModal");
    if (userEditModal) userEditModal.style.display = "grid";
  }


  function renderSchedules() {
    scheduleContainer.innerHTML = "";
    const currentState = getState();
    const myVehicleIds = myVehicles.map(v => v.id);
    const myServices = currentState.services.filter(s => myVehicleIds.includes(s.vehicleId) && s.status === "Terjadwal");

    if (myServices.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "empty";
      emptyDiv.style.color = "#bdd2ca";
      emptyDiv.textContent = "Belum ada servis terjadwal.";
      scheduleContainer.appendChild(emptyDiv);
      return;
    }

    myServices.forEach(s => {
      const v = currentState.vehicles.find(item => item.id === s.vehicleId);
      
      const dateParts = s.date.split("-");
      const year = dateParts[0] || "";
      const monthNum = dateParts[1] || "";
      const day = dateParts[2] || "";

      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      const monthName = months[Number(monthNum) - 1] || monthNum;

      const card = document.createElement("article");
      card.className = "schedule-card";
      card.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:18px 20px; border-radius:14px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12); margin-bottom:14px; gap:16px; flex-wrap:wrap;";

      const mainDiv = document.createElement("div");
      mainDiv.style.cssText = "display:flex; gap:18px; align-items:center; flex:1; min-width:280px;";

      const dateBox = document.createElement("div");
      dateBox.style.cssText = "min-width:76px; padding:10px 12px; background:#ffffff; color:#1e293b; border-radius:12px; text-align:center; box-shadow:0 4px 10px rgba(0,0,0,0.15); display:flex; flex-direction:column; justify-content:center; align-items:center;";

      const dateDay = document.createElement("span");
      dateDay.style.cssText = "font-size:26px; font-weight:800; line-height:1; color:#1e293b;";
      dateDay.textContent = day;

      const dateMonthYear = document.createElement("span");
      dateMonthYear.style.cssText = "font-size:11px; font-weight:600; text-transform:uppercase; color:#64748b; margin-top:4px; white-space:nowrap;";
      dateMonthYear.textContent = `${monthName} ${year}`;

      dateBox.appendChild(dateDay);
      dateBox.appendChild(dateMonthYear);

      const infoDiv = document.createElement("div");
      infoDiv.style.cssText = "display:flex; flex-direction:column; gap:4px;";
      
      const strongType = document.createElement("strong");
      strongType.style.cssText = "font-size:17px; color:#ffffff; font-weight:700;";
      strongType.textContent = s.serviceType || "Servis";

      const subMeta = document.createElement("p");
      subMeta.style.cssText = "margin:0; font-size:13.5px; color:#cbd5e1; font-weight:500;";
      subMeta.textContent = `${v ? v.name : "-"} (${v ? v.plate : ""}) · ${s.workshop}`;

      const detailMeta = document.createElement("p");
      detailMeta.style.cssText = "margin:2px 0 0; font-size:12.5px; color:#94a3b8;";
      detailMeta.textContent = `Target Odometer: ${Number(s.odometer).toLocaleString("id-ID")} km | Estimasi: Rp ${Number(s.cost).toLocaleString("id-ID")}`;

      infoDiv.appendChild(strongType);
      infoDiv.appendChild(subMeta);
      infoDiv.appendChild(detailMeta);

      if (s.notes) {
        const noteP = document.createElement("p");
        noteP.style.cssText = "margin:2px 0 0; font-size:12px; color:#e2e8f0; font-style:italic;";
        noteP.textContent = `Catatan: "${s.notes}"`;
        infoDiv.appendChild(noteP);
      }

      mainDiv.appendChild(dateBox);
      mainDiv.appendChild(infoDiv);

      const actionDiv = document.createElement("div");
      actionDiv.style.cssText = "display:flex; gap:10px; align-items:center;";

      const finishBtn = document.createElement("button");
      finishBtn.style.cssText = "padding:8px 16px; font-size:13px; font-weight:600; border-radius:8px; border:none; background:#22c55e; color:#ffffff; cursor:pointer; transition:all 0.2s;";
      finishBtn.textContent = "Selesai";
      finishBtn.addEventListener("click", () => openUserCompleteModal(s.id)); 

      const editBtn = document.createElement("button");
      editBtn.style.cssText = "padding:8px 16px; font-size:13px; font-weight:600; border-radius:8px; border:none; background:#ffffff; color:#0f172a; cursor:pointer; transition:all 0.2s;";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => openUserEditServiceModal(s.id));

      const delBtn = document.createElement("button");
      delBtn.style.cssText = "padding:8px 16px; font-size:13px; font-weight:600; border-radius:8px; border:none; background:#ef4444; color:#ffffff; cursor:pointer; transition:all 0.2s;";
      delBtn.textContent = "Hapus";
      delBtn.addEventListener("click", () => deleteUserSchedule(s.id));

      actionDiv.appendChild(finishBtn);
      actionDiv.appendChild(editBtn);
      actionDiv.appendChild(delBtn);

      card.appendChild(mainDiv);
      card.appendChild(actionDiv);
      scheduleContainer.appendChild(card);
    });
  }

  renderSchedules();

  const serviceModal = document.querySelector("#serviceModal");
  const openBtn = document.querySelector("#openAddServiceModalBtn");
  const closeBtn = document.querySelector("#closeServiceModalBtn");

  if (openBtn && serviceModal) openBtn.addEventListener("click", () => serviceModal.style.display = "grid");
  if (closeBtn && serviceModal) closeBtn.addEventListener("click", () => serviceModal.style.display = "none");

  document.querySelector("#serviceForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const currentState = getState();
    const newService = {
      id: Date.now(),
      vehicleId: Number(document.querySelector("#sVehicleId").value),
      serviceType: document.querySelector("#sServiceType").value.trim(),
      date: document.querySelector("#sDate").value,
      odometer: Number(document.querySelector("#sOdometer").value),
      workshop: document.querySelector("#sWorkshop").value.trim(),
      cost: Number(document.querySelector("#sCost").value),
      notes: document.querySelector("#sNotes").value.trim(),
      status: "Terjadwal"
    };
    currentState.services.push(newService);
    saveState(currentState);
    if (serviceModal) serviceModal.style.display = "none";
    document.querySelector("#serviceForm").reset();
    showToast("Jadwal servis berhasil ditambahkan!");
    renderSchedules();
    updateStatsGrid();
  });

  const userEditModal = document.querySelector("#userEditServiceModal");
  const closeUserEditModalBtn = document.querySelector("#closeUserEditServiceModalBtn");

  if (closeUserEditModalBtn && userEditModal) {
    closeUserEditModalBtn.addEventListener("click", () => userEditModal.style.display = "none");
  }

  window.openUserEditServiceModal = function(serviceId) {
    const currentState = getState();
    const s = currentState.services.find(item => item.id === serviceId);
    if (!s) return;

    document.querySelector("#uEditServiceId").value = s.id;
    document.querySelector("#uEditVehicleId").value = s.vehicleId;
    document.querySelector("#uEditServiceType").value = s.serviceType || "";
    document.querySelector("#uEditDate").value = s.date;
    document.querySelector("#uEditOdometer").value = s.odometer;
    document.querySelector("#uEditWorkshop").value = s.workshop;
    document.querySelector("#uEditCost").value = s.cost;
    document.querySelector("#uEditNotes").value = s.notes || "";

    if (userEditModal) userEditModal.style.display = "grid";
  };

  const userEditForm = document.querySelector("#userEditServiceForm");
  if (userEditForm) {
    userEditForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const currentState = getState();
      const sId = Number(document.querySelector("#uEditServiceId").value);
      const s = currentState.services.find(item => item.id === sId);

      if (s) {
        s.vehicleId = Number(document.querySelector("#uEditVehicleId").value);
        s.serviceType = document.querySelector("#uEditServiceType").value.trim();
        s.date = document.querySelector("#uEditDate").value;
        s.odometer = Number(document.querySelector("#uEditOdometer").value);
        s.workshop = document.querySelector("#uEditWorkshop").value.trim();
        s.cost = Number(document.querySelector("#uEditCost").value);
        s.notes = document.querySelector("#uEditNotes").value.trim();

        // Jika dipicu dari tombol Selesai, ubah status menjadi Selesai
        if (isCompletingService) {
          s.status = "Selesai";
          isCompletingService = false; // Reset kembali
          showToast("Servis berhasil dikonfirmasi dan masuk ke riwayat!");
        } else {
          showToast("Jadwal servis berhasil diperbarui!");
        }

        saveState(currentState);
        
        const userEditModal = document.querySelector("#userEditServiceModal");
        if (userEditModal) userEditModal.style.display = "none";
        
        renderSchedules();
        updateStatsGrid();
      }
    });
  }

  function deleteUserSchedule(serviceId) {
    if (!confirm("Batalkan/hapus jadwal servis ini?")) return;
    const currentState = getState();
    currentState.services = currentState.services.filter(s => s.id !== serviceId);
    saveState(currentState);
    showToast("Jadwal servis dihapus.");
    renderSchedules();
    updateStatsGrid();
  }
}

// 4. Logika Riwayat (riwayat.html - Read Only)
const historyTableBody = document.querySelector("#historyTableBody");
if (historyTableBody) {
  const currentUserId = Number(localStorage.getItem(SESSION_KEY));
  const state = getState();
  const myVehicles = state.vehicles.filter(v => v.owner_id === currentUserId);

  function renderHistory() {
    const currentState = getState();
    const myVehicleIds = myVehicles.map(v => v.id);
    const completedServices = currentState.services.filter(s => myVehicleIds.includes(s.vehicleId) && s.status === "Selesai");

    const searchVal = (document.querySelector("#historySearchInput")?.value || "").toLowerCase();
    
    const startDate = document.querySelector("#historyStartDate")?.value;
    const endDate = document.querySelector("#historyEndDate")?.value;

    const filteredServices = completedServices.filter(s => {
      const v = currentState.vehicles.find(item => item.id === s.vehicleId);
      const vehicleText = v ? `${v.name} ${v.plate}`.toLowerCase() : "";
      const typeText = (s.serviceType || "").toLowerCase();
      const workshopText = (s.workshop || "").toLowerCase();
      const notesText = (s.notes || "").toLowerCase();
      
      const matchesSearch = vehicleText.includes(searchVal) || typeText.includes(searchVal) || workshopText.includes(searchVal) || notesText.includes(searchVal);

      let matchesDate = true;
      if (startDate && s.date < startDate) matchesDate = false;
      if (endDate && s.date > endDate) matchesDate = false;

      return matchesSearch && matchesDate;
    });

    historyTableBody.innerHTML = "";

    if (filteredServices.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 5; // Disesuaikan menjadi 5 kolom karena tombol edit dihapus
      const div = document.createElement("div");
      div.className = "empty";
      div.textContent = "Data Tidak Ditemukan.";
      td.appendChild(div);
      tr.appendChild(td);
      historyTableBody.appendChild(tr);
      return;
    }

    filteredServices.forEach(s => {
      const v = currentState.vehicles.find(item => item.id === s.vehicleId);
      
      const row = document.createElement("tr");

      const td1 = document.createElement("td");
      const strong1 = document.createElement("strong");
      strong1.textContent = v ? v.name : "-";
      const br1 = document.createElement("br");
      const small1 = document.createElement("small");
      small1.className = "muted";
      small1.textContent = v ? v.plate : "";
      td1.appendChild(strong1);
      td1.appendChild(br1);
      td1.appendChild(small1);

      const td2 = document.createElement("td");
      const strong2 = document.createElement("strong");
      strong2.textContent = s.serviceType || "-";
      const br2 = document.createElement("br");
      const small2 = document.createElement("small");
      small2.className = "muted";
      small2.textContent = s.notes || "Tanpa catatan";
      td2.appendChild(strong2);
      td2.appendChild(br2);
      td2.appendChild(small2);

      const td3 = document.createElement("td");
      td3.textContent = s.date;
      const br3 = document.createElement("br");
      const small3 = document.createElement("small");
      small3.className = "muted";
      small3.textContent = `${Number(s.odometer).toLocaleString("id-ID")} km`;
      td3.appendChild(br3);
      td3.appendChild(small3);

      const td4 = document.createElement("td");
      td4.textContent = s.workshop;

      const td5 = document.createElement("td");
      const strong5 = document.createElement("strong");
      strong5.textContent = `Rp ${Number(s.cost).toLocaleString("id-ID")}`;
      td5.appendChild(strong5);

      row.appendChild(td1);
      row.appendChild(td2);
      row.appendChild(td3);
      row.appendChild(td4);
      row.appendChild(td5);
      historyTableBody.appendChild(row);
    });
  }

  renderHistory();

  document.querySelector("#historySearchInput")?.addEventListener("input", renderHistory);
  document.querySelector("#historyStartDate")?.addEventListener("change", renderHistory);
  document.querySelector("#historyEndDate")?.addEventListener("change", renderHistory);
}

// 5. Logika Pengaturan (pengaturan.html)
const profileForm = document.querySelector("#profileForm");
if (profileForm) {
  const currentUserId = Number(localStorage.getItem(SESSION_KEY));
  const state = getState();
  const currentUser = state.users.find(u => u.id_user === currentUserId);

  if (currentUser) {
    document.querySelector("#profName").value = currentUser.name || "";
    document.querySelector("#profEmail").value = currentUser.email || "";
    document.querySelector("#profPhone").value = currentUser.phone || "";
  }

  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (currentUser) {
      currentUser.name = document.querySelector("#profName").value.trim();
      currentUser.email = document.querySelector("#profEmail").value.trim();
      currentUser.phone = document.querySelector("#profPhone").value.trim();
      saveState(state);
      showToast("Profil berhasil diperbarui.");
    }
  });

  document.querySelector("#themeLightBtn")?.addEventListener("click", () => {
    state.settings = { theme: "light" };
    saveState(state);
    applyTheme();
    showToast("Tema Terang diaktifkan.");
  });

  document.querySelector("#themeDarkBtn")?.addEventListener("click", () => {
    state.settings = { theme: "dark" };
    saveState(state);
    applyTheme();
    showToast("Tema Gelap diaktifkan.");
  });

  document.querySelector("#exportDataBtn")?.addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `vcare-backup.json`);
    dlAnchor.click();
  });

  document.querySelector("#resetDataBtn")?.addEventListener("click", () => {
    if (!confirm("Reset semua data ke contoh awal?")) return;
    localStorage.removeItem(STORAGE_KEY);
    showToast("Data dipulihkan ke contoh awal.");
    setTimeout(() => window.location.reload(), 1000);
  });
}

// 6. Logika Rekap Biaya (rekap_biaya.html)
const recapContainer = document.querySelector("#recapDistributionContainer");
if (recapContainer) {
  const currentUserId = Number(localStorage.getItem(SESSION_KEY));
  const state = getState();

  function renderRecap() {
    const myVehicles = state.vehicles.filter(v => v.owner_id === currentUserId);
    const myVehicleIds = myVehicles.map(v => v.id);
    const completedServices = state.services.filter(s => myVehicleIds.includes(s.vehicleId) && s.status === "Selesai");

    const periodFilter = document.querySelector("#rekapPeriodFilter")?.value || "all";
    const now = new Date();
    const currentYear = String(now.getFullYear());
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');

    const filteredCompletedServices = completedServices.filter(s => {
      if (periodFilter === "this_month") {
        return s.date.startsWith(`${currentYear}-${currentMonth}`);
      } else if (periodFilter === "this_year") {
        return s.date.startsWith(`${currentYear}`);
      }
      return true;
    });

    const totalCost = filteredCompletedServices.reduce((acc, curr) => acc + Number(curr.cost || 0), 0);
    const totalCount = filteredCompletedServices.length;
    const avgCost = totalCount > 0 ? Math.round(totalCost / totalCount) : 0;

    document.querySelector("#totalCostStat").textContent = `Rp ${totalCost.toLocaleString("id-ID")}`;
    document.querySelector("#totalTransactionsStat").textContent = `${totalCount} transaksi`;
    document.querySelector("#avgCostStat").textContent = `Rp ${avgCost.toLocaleString("id-ID")}`;

    const groups = myVehicles.map(v => {
      const records = filteredCompletedServices.filter(s => s.vehicleId === v.id);
      const sumCost = records.reduce((acc, curr) => acc + Number(curr.cost || 0), 0);
      return { vehicle: v, total: sumCost, count: records.length };
    }).filter(item => item.count > 0);

    const maxCost = Math.max(...groups.map(g => g.total), 1);

    recapContainer.innerHTML = "";
    if (groups.length === 0) {
      const div = document.createElement("div");
      div.className = "empty";
      div.textContent = "Belum ada biaya servis yang tercatat untuk periode ini.";
      recapContainer.appendChild(div);
    } else {
      groups.forEach(item => {
        const percentage = Math.round((item.total / maxCost) * 100);
        const row = document.createElement("div");
        row.className = "recap-row";

        const rowBetween = document.createElement("div");
        rowBetween.className = "row-between";

        const infoDiv = document.createElement("div");
        const strongName = document.createElement("strong");
        strongName.textContent = `${item.vehicle.name} (${item.vehicle.plate})`;
        const br = document.createElement("br");
        const smallCount = document.createElement("small");
        smallCount.className = "muted";
        smallCount.textContent = `${item.count} transaksi selesai`;
        infoDiv.appendChild(strongName);
        infoDiv.appendChild(br);
        infoDiv.appendChild(smallCount);

        const strongTotal = document.createElement("strong");
        strongTotal.textContent = `Rp ${item.total.toLocaleString("id-ID")}`;

        rowBetween.appendChild(infoDiv);
        rowBetween.appendChild(strongTotal);

        const progressDiv = document.createElement("div");
        progressDiv.className = "progress";
        progressDiv.style.marginTop = "10px";
        const spanBar = document.createElement("span");
        spanBar.style.width = `${percentage}%`;
        progressDiv.appendChild(spanBar);

        row.appendChild(rowBetween);
        row.appendChild(progressDiv);
        recapContainer.appendChild(row);
      });
    }
  }

  renderRecap();
  document.querySelector("#rekapPeriodFilter")?.addEventListener("change", renderRecap);
}

// 7. Tombol Logout Global
const logoutBtn = document.querySelector("#logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "index.html";
  });
}

// 8. Tampilan Ringkasan Dashboard (dashboard.html - READ ONLY)
const dashboardVehicleContainer = document.querySelector("#dashboardVehicleContainer");
if (dashboardVehicleContainer) {
  const currentUserId = Number(localStorage.getItem(SESSION_KEY));
  const state = getState();
  const user = state.users.find(u => u.id_user === currentUserId);

  if (!user) {
    window.location.href = "index.html";
  }

  function renderDashboardVehicles() {
    dashboardVehicleContainer.innerHTML = "";
    const searchVal = (document.querySelector("#searchInput")?.value || "").toLowerCase();
    
    // 1. Ambil kendaraan milik user aktif yang sesuai pencarian
    let myVehicles = state.vehicles.filter(v => 
      v.owner_id === currentUserId && `${v.name} ${v.plate}`.toLowerCase().includes(searchVal)
    );

    if (myVehicles.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "empty";
      emptyDiv.textContent = "Belum ada kendaraan. Tambahkan kendaraan melalui menu Garasi.";
      dashboardVehicleContainer.appendChild(emptyDiv);
      return;
    }

    // 2. Hubungkan setiap kendaraan dengan tanggal servis terakhirnya
    const vehiclesWithLatestService = myVehicles.map(v => {
      const latestService = state.services
        .filter(s => s.vehicleId === v.id && s.status === "Selesai")
        .sort((a, b) => b.date.localeCompare(a.date))[0];

      return {
        vehicle: v,
        latestServiceDate: latestService ? latestService.date : "0000-00-00", // "0000-00-00" untuk yang belum pernah servis
        latestService: latestService
      };
    });

    // 3. URUTKAN: Kendaraan dengan tanggal servis paling baru (terbaru -> terlama)
    vehiclesWithLatestService.sort((a, b) => b.latestServiceDate.localeCompare(a.latestServiceDate));

    // 4. BATASI: Ambil HANYA 2 KENDARAAN teratas
    const top2Vehicles = vehiclesWithLatestService.slice(0, 2);

    // 5. Cetak kartu kendaraan
    top2Vehicles.forEach(item => {
      const v = item.vehicle;
      const latestService = item.latestService;

      const card = document.createElement("article");
      card.className = "vehicle-card";

      const head = document.createElement("div");
      head.className = "vehicle-head";

      const info = document.createElement("div");
      info.className = "vehicle-info";

      const icon = document.createElement("span");
      icon.className = "vehicle-icon";
      icon.style.background = v.color || "#3d7165";
      icon.innerHTML = '<i class="fa-solid fa-car"></i>';

      const textDiv = document.createElement("div");
      const h3 = document.createElement("h3");
      h3.textContent = v.name;
      const p = document.createElement("p");
      p.textContent = `${v.plate} · ${v.year}`;
      textDiv.appendChild(h3);
      textDiv.appendChild(p);

      info.appendChild(icon);
      info.appendChild(textDiv);
      head.appendChild(info);

      const meta = document.createElement("div");
      meta.className = "vehicle-meta";

      const box1 = document.createElement("div");
      box1.className = "meta-box";
      const span1 = document.createElement("span");
      span1.textContent = "Odometer";
      const strong1 = document.createElement("strong");
      strong1.textContent = `${Number(v.odometer).toLocaleString("id-ID")} km`;
      box1.appendChild(span1);
      box1.appendChild(strong1);

      const box2 = document.createElement("div");
      box2.className = "meta-box";
      const span2 = document.createElement("span");
      span2.textContent = "Servis terakhir";
      const strong2 = document.createElement("strong");
      strong2.textContent = latestService ? latestService.date : "Belum ada";
      box2.appendChild(span2);
      box2.appendChild(strong2);

      meta.appendChild(box1);
      meta.appendChild(box2);

      card.appendChild(head);
      card.appendChild(meta);
      dashboardVehicleContainer.appendChild(card);
    });
  }

  renderDashboardVehicles();
  document.querySelector("#searchInput")?.addEventListener("input", renderDashboardVehicles);
}

// 9. Fungsi Pembaruan Kartu Statistik
function updateStatsGrid() {
  const currentUserId = Number(localStorage.getItem(SESSION_KEY));
  if (!currentUserId) return;

  const state = getState();
  
  const myVehicles = state.vehicles.filter(v => v.owner_id === currentUserId);
  const myVehicleIds = myVehicles.map(v => v.id);

  const totalVehicles = myVehicles.length;

  const scheduledServices = state.services
    .filter(s => myVehicleIds.includes(s.vehicleId) && s.status === "Terjadwal")
    .sort((a, b) => a.date.localeCompare(b.date));
  
  const nextService = scheduledServices[0];

  const completedServices = state.services.filter(s => myVehicleIds.includes(s.vehicleId) && s.status === "Selesai");
  const totalCost = completedServices.reduce((acc, curr) => acc + Number(curr.cost || 0), 0);

  const statVehiclesEl = document.querySelector("#statTotalVehicles");
  const statNextDateEl = document.querySelector("#statNextService");
  const statNextTypeEl = document.querySelector("#statNextServiceType");
  const statTotalCostEl = document.querySelector("#statTotalCost");

  if (statVehiclesEl) {
    statVehiclesEl.textContent = totalVehicles;
  }

  if (statNextDateEl && statNextTypeEl) {
    if (nextService) {
      statNextDateEl.textContent = nextService.date;
      statNextTypeEl.textContent = nextService.serviceType || "Servis Terjadwal";
    } else {
      statNextDateEl.textContent = "Belum ada";
      statNextTypeEl.textContent = "Buat jadwal baru";
    }
  }

  if (statTotalCostEl) {
    statTotalCostEl.textContent = `Rp ${totalCost.toLocaleString("id-ID")}`;
  }
}

updateStatsGrid();

// Logika Membuka/Menutup Pop-up Menu Mobile
const mobileMenuBtn = document.querySelector("#mobileMenuBtn");
const mobileMenuPopup = document.querySelector("#mobileMenuPopup");
const closePopupBtn = document.querySelector("#closePopupBtn");

if (mobileMenuBtn && mobileMenuPopup) {
  mobileMenuBtn.addEventListener("click", () => {
    const isOpen = mobileMenuPopup.style.display === "flex";
    if (isOpen) {
      mobileMenuPopup.style.display = "none";
      mobileMenuBtn.classList.remove("active");
    } else {
      mobileMenuPopup.style.display = "flex";
      mobileMenuBtn.classList.add("active");
    }
  });

  closePopupBtn?.addEventListener("click", () => {
    mobileMenuPopup.style.display = "none";
    mobileMenuBtn.classList.remove("active");
  });

  // Tutup pop-up jika pengguna mengklik area luar kotak menu
  mobileMenuPopup.addEventListener("click", (e) => {
    if (e.target === mobileMenuPopup) {
      mobileMenuPopup.style.display = "none";
      mobileMenuBtn.classList.remove("active");
    }
  });
}
// Otomatis tandai menu aktif di pop-up berdasarkan halaman saat ini
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();
  const popupLinks = document.querySelectorAll(".popup-list a");
  
  popupLinks.forEach(link => {
    const linkPage = link.getAttribute("href");
    if (linkPage === currentPage) {
      link.classList.add("active");
    }
  });
});