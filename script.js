// --- Utility functions ---
function getProfiles() {
  return JSON.parse(localStorage.getItem('profiles') || '[]');
}
function saveProfiles(profiles) {
  localStorage.setItem('profiles', JSON.stringify(profiles));
}

// --- Validation ---
function showError(inputId, message) {
  document.getElementById(inputId + "Error").textContent = message || "";
}
function validateForm() {
  let valid = true;

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const programmeSel = document.getElementById("programme").value;
  const otherProgramme = document.getElementById("otherProgramme").value.trim();
  const year = document.getElementById("year").value;
  const photo = document.getElementById("photo").value.trim();

  // Basic Required Field Validation
  if (!firstName) { showError("firstName", "First name is required."); valid = false; } else { showError("firstName", ""); }
  if (!lastName) { showError("lastName", "Last name is required."); valid = false; } else { showError("lastName", ""); }
  if (!programmeSel) { showError("programme", "Programme is required."); valid = false; } else { showError("programme", ""); }
  if (!year) { showError("year", "Year is required."); valid = false; } else { showError("year", ""); }

  // Email Format Validation
  if (!/\S+@\S+\.\S+/.test(email)) { showError("email", "Valid email required."); valid = false; } else { showError("email", ""); }

  // 'Other Programme' specificity check
  if (programmeSel === "other" && !otherProgramme) { showError("otherProgramme", "Specify programme."); valid = false; } else { showError("otherProgramme", ""); }

  // Photo URL format check
  if (photo && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(photo)) {
    showError("photo", "Must be a valid image URL.");
    valid = false;
  } else {
    showError("photo", "");
  }

  // Check duplicates
  const profiles = getProfiles();
  const editIdx = document.getElementById("regForm").getAttribute("data-edit-idx");
  // Check if any existing profile (excluding the one being edited) has the same email
  if (profiles.some((p, i) => p.email === email && i != editIdx)) {
    showError("email", "Email already registered.");
    valid = false;
  }
  
  // Re-check validity based on error messages visible
  return valid;
}

// --- Rendering ---
function renderProfiles(filter = "") {
  const profiles = getProfiles();
  const cards = document.getElementById("cards");
  const summary = document.getElementById("summary");
  cards.innerHTML = "";
  summary.innerHTML = "";

  const lowerFilter = filter.trim().toLowerCase();
  let found = false;

  profiles.forEach((profile, idx) => {
    // Filtering logic
    if (
      lowerFilter &&
      !(
        profile.firstName.toLowerCase().includes(lowerFilter) ||
        profile.lastName.toLowerCase().includes(lowerFilter) ||
        profile.email.toLowerCase().includes(lowerFilter) ||
        profile.programme.toLowerCase().includes(lowerFilter)
      )
    ) return;

    found = true;
    const card = document.createElement("div");
    card.className = "card";
    
    // Use placeholder image if photo is missing
    const photoURL = profile.photo ? profile.photo : 'https://via.placeholder.com/300?text=No+Photo';
    
    card.innerHTML = `
      <img src="${photoURL}" alt="Photo of ${profile.firstName}">
      <h3>${profile.firstName} ${profile.lastName}</h3>
      <p><strong>Email:</strong> ${profile.email}</p>
      <p><strong>Programme:</strong> ${profile.programme}</p>
      <p><strong>Year:</strong> ${profile.year}</p>
      ${profile.interests ? `<p><strong>Interests:</strong> ${profile.interests}</p>` : ""}
      <button onclick="editProfile(${idx})">Edit</button>
      <button class="remove-btn" onclick="removeProfile(${idx})">Remove</button>
    `;
    cards.appendChild(card);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${profile.firstName} ${profile.lastName}</td>
      <td>${profile.email}</td>
      <td>${profile.programme}</td>
      <td>${profile.year}</td>
      <td>
        <button onclick="editProfile(${idx})">Edit</button>
        <button class="remove-btn" onclick="removeProfile(${idx})">Remove</button>
      </td>
    `;
    summary.appendChild(tr);
  });

  if (!found) {
    cards.innerHTML = "<p>No profiles found matching your search criteria.</p>";
  }
}

// --- Profile Management (Globally accessible via window scope) ---
window.removeProfile = function(idx) {
  if (!confirm("Are you sure you want to remove this profile?")) return;
  const profiles = getProfiles();
  profiles.splice(idx, 1);
  saveProfiles(profiles);
  renderProfiles(document.getElementById("search").value);
};

window.editProfile = function(idx) {
  const profiles = getProfiles();
  const profile = profiles[idx];
  
  // Clear any existing error messages before editing
  Array.from(document.querySelectorAll(".error")).forEach(e => e.textContent = "");

  document.getElementById("firstName").value = profile.firstName;
  document.getElementById("lastName").value = profile.lastName;
  document.getElementById("email").value = profile.email;
  document.getElementById("year").value = profile.year;
  document.getElementById("interests").value = profile.interests || "";
  document.getElementById("photo").value = profile.photo || "";
  
  // Handle Programme selection (setting to 'other' if needed)
  const officialPrograms = ["BSc Computer Science","BEng Software Engineering","BSc Information Systems"];
  if (officialPrograms.includes(profile.programme)) {
    document.getElementById("programme").value = profile.programme;
    document.getElementById("otherProgrammeContainer").style.display = "none";
    document.getElementById("otherProgramme").value = "";
  } else {
    document.getElementById("programme").value = "other";
    document.getElementById("otherProgrammeContainer").style.display = "";
    document.getElementById("otherProgramme").value = profile.programme;
  }

  document.getElementById("regForm").setAttribute("data-edit-idx", idx);
  document.getElementById("submitBtn").textContent = "Update Profile";
  document.getElementById("cancelEdit").style.display = "inline-block";
  document.getElementById("regForm").scrollIntoView({ behavior: "smooth" });
};

// --- Form Submit ---
document.getElementById("regForm").addEventListener("submit", function(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const programmeSel = document.getElementById("programme").value;
  const otherProgramme = document.getElementById("otherProgramme").value.trim();
  const year = document.getElementById("year").value;
  const interests = document.getElementById("interests").value.trim();
  const photo = document.getElementById("photo").value.trim();

  const programme = programmeSel === "other" ? otherProgramme : programmeSel;
  const profile = { firstName, lastName, email, programme, year, interests, photo };

  let profiles = getProfiles();
  const editIdx = this.getAttribute("data-edit-idx");
  
  if (editIdx) {
    // Update existing profile
    profiles[parseInt(editIdx, 10)] = profile;
    this.removeAttribute("data-edit-idx");
  } else {
    // Add new profile
    profiles.push(profile);
  }
  
  saveProfiles(profiles);
  renderProfiles(document.getElementById("search").value);

  // Reset form and UI state
  this.reset();
  document.getElementById("otherProgrammeContainer").style.display = "none";
  document.getElementById("submitBtn").textContent = "Register";
  document.getElementById("cancelEdit").style.display = "none";
  Array.from(document.querySelectorAll(".error")).forEach(e => e.textContent = "");
});

// --- Cancel Edit ---
document.getElementById("cancelEdit").addEventListener("click", () => {
  document.getElementById("regForm").reset();
  document.getElementById("regForm").removeAttribute("data-edit-idx");
  document.getElementById("otherProgrammeContainer").style.display = "none";
  document.getElementById("submitBtn").textContent = "Register";
  document.getElementById("cancelEdit").style.display = "none";
  // Clear error messages on cancel
  Array.from(document.querySelectorAll(".error")).forEach(e => e.textContent = "");
});

// --- Programme dropdown toggle ---
document.getElementById("programme").addEventListener("change", function() {
  const otherContainer = document.getElementById("otherProgrammeContainer");
  if (this.value === "other") {
    otherContainer.style.display = "";
    document.getElementById("otherProgramme").setAttribute("required", "required");
  } else {
    otherContainer.style.display = "none";
    document.getElementById("otherProgramme").removeAttribute("required");
  }
});

// --- Search ---
document.getElementById("search").addEventListener("input", function() {
  renderProfiles(this.value);
});

// --- Clear Search Button ---
document.getElementById("clearSearch").addEventListener("click", function() {
  document.getElementById("search").value = "";
  renderProfiles("");
});

// --- On load ---
window.addEventListener("DOMContentLoaded", () => {
  renderProfiles();
});