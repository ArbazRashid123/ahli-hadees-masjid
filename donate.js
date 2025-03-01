// Firebase Initialization
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

console.log("Initializing Firebase...");
let db;
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  console.log("Firebase initialized successfully");
} catch (err) {
  console.error("Error initializing Firebase:", err);
}

// Common Secret Password (temporary)
const SECRET_PASSWORD = "123456";

// Hamburger Menu
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
  });
});

// Copy to Clipboard
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const copyable = btn.parentElement;
    const text = copyable.getAttribute('data-text');
    navigator.clipboard.writeText(text).then(() => {
      copyable.classList.add('copied');
      setTimeout(() => copyable.classList.remove('copied'), 1000);
    });
  });
});

// Show Scanner Toggle
document.querySelectorAll('.show-scanner').forEach(btn => {
  btn.addEventListener('click', () => {
    const scanner = btn.parentElement.nextElementSibling;
    scanner.classList.toggle('visible');
  });
});

// Scroll Progress Bar
const progressBar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  progressBar.style.width = scrollPercent + '%';
});

// Back-to-Top Button
const backToTop = document.querySelector('.back-to-top');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 300);
});
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Scroll Animations
const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, index * 100);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.donation-card').forEach(el => observer.observe(el));
document.querySelector('.container').classList.add('visible');

// Load Receipt History from Firestore on Page Load
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM fully loaded, displaying receipt history...");
  displayReceiptHistory();
});

// Function to Generate PDF
const generatePDF = async (element, receiptNumber) => {
  console.log("Generating PDF for receipt:", receiptNumber);
  try {
    const canvas = await html2canvas(element, { scale: 2 });
    console.log("Canvas generated:", canvas);
    const imgData = canvas.toDataURL('image/png');
    console.log("Image data generated:", imgData.substring(0, 50) + "...");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    const blob = pdf.output('blob');
    console.log("PDF blob generated:", blob);
    return blob;
  } catch (err) {
    console.error("Error generating PDF:", err);
    throw err;
  }
};

// Function to Save Receipt to Firestore
const saveReceiptToFirestore = async (receiptData) => {
  console.log("Saving receipt to Firestore:", receiptData);
  try {
    await db.collection('receipts').add({
      ...receiptData,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log("Receipt saved to Firestore successfully");
    displayReceiptHistory();
  } catch (err) {
    console.error("Error saving receipt to Firestore:", err);
  }
};

// Function to Display Receipt History from Firestore
const displayReceiptHistory = () => {
  console.log("Displaying receipt history...");
  const historyList = document.getElementById('history-list');
  if (!historyList) {
    console.error("History list element not found");
    return;
  }
  historyList.innerHTML = '';

  db.collection('receipts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
    historyList.innerHTML = '';
    if (snapshot.empty) {
      historyList.innerHTML = '<p>No receipts generated yet.</p>';
      return;
    }

    snapshot.forEach(doc => {
      const receiptData = doc.data();
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      historyItem.innerHTML = `
        <div>
          <p><strong>Receipt No:</strong> ${receiptData.receiptNumber}</p>
          <p><strong>Donor Name:</strong> ${receiptData.donorName}</p>
          <p><strong>Amount:</strong> Rs.${receiptData.amount}</p>
          <p><strong>Purpose:</strong> ${receiptData.purpose}</p>
          <p><strong>Date:</strong> ${receiptData.date}</p>
        </div>
        <div>
          <p><strong>Receipt Giver:</strong> ${receiptData.receiptGiver}</p>
          <p><strong>Mobile Number:</strong> ${receiptData.mobileNumber}</p>
        </div>
        <div class="history-buttons">
          <button onclick="reDownloadReceipt('${doc.id}')">Re-Download</button>
          <button onclick="reShareReceipt('${doc.id}')">Re-Share</button>
        </div>
      `;
      historyList.appendChild(historyItem);
    });
  }, err => {
    console.error("Error fetching receipt history:", err);
    historyList.innerHTML = '<p>Error loading receipt history.</p>';
  });
};

// Function to Re-Download Receipt
window.reDownloadReceipt = async (docId) => {
  console.log("Re-downloading receipt with ID:", docId);
  const doc = await db.collection('receipts').doc(docId).get();
  if (!doc.exists) {
    console.error("Receipt not found");
    return;
  }
  const receiptData = doc.data();
  console.log("Receipt data fetched:", receiptData);

  // Create a temporary element to render the receipt content
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.innerHTML = `
    <div class="receipt-content">
      <h2>Zakatul Fitr</h2>
      <h3>Donation Receipt</h3>
      <p>Address: Cherwan Kangan, 191202</p>
      <p>Phone: 6006254589, 9622000919</p>
      <hr>
      <p><strong>Receipt No:</strong> ${receiptData.receiptNumber}</p>
      <p><strong>Date:</strong> ${receiptData.date}</p>
      <hr>
      <p><strong>Received From:</strong> ${receiptData.donorName}</p>
      <p><strong>Amount:</strong> Rs.${receiptData.amount}</p>
      <p><strong>Purpose:</strong> ${receiptData.purpose}</p>
      <hr>
      <div class="signature-line"></div>
      <p>Unit President Showkat Ahmad Mir</p>
      <p class="quote">"Whoever feeds a fasting person will have a reward like that of the fasting person, without diminishing their reward in any way." - Prophet Muhammad (SAW)</p>
      <p class="thank-you">Thank you for your generous contribution!</p>
    </div>
  `;
  document.body.appendChild(tempDiv);

  const element = tempDiv.querySelector('.receipt-content');
  const blob = await generatePDF(element, receiptData.receiptNumber);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Receipt_${receiptData.receiptNumber}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  document.body.removeChild(tempDiv);
  URL.revokeObjectURL(url);
};

// Function to Re-Share Receipt
window.reShareReceipt = async (docId) => {
  console.log("Re-sharing receipt with ID:", docId);
  const doc = await db.collection('receipts').doc(docId).get();
  if (!doc.exists) {
    console.error("Receipt not found");
    return;
  }
  const receiptData = doc.data();
  console.log("Receipt data fetched:", receiptData);

  // Create a temporary element to render the receipt content
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.innerHTML = `
    <div class="receipt-content">
      <h2>Zakatul Fitr</h2>
      <h3>Donation Receipt</h3>
      <p>Address: Cherwan Kangan, 191202</p>
      <p>Phone: 6006254589, 9622000919</p>
      <hr>
      <p><strong>Receipt No:</strong> ${receiptData.receiptNumber}</p>
      <p><strong>Date:</strong> ${receiptData.date}</p>
      <hr>
      <p><strong>Received From:</strong> ${receiptData.donorName}</p>
      <p><strong>Amount:</strong> Rs.${receiptData.amount}</p>
      <p><strong>Purpose:</strong> ${receiptData.purpose}</p>
      <hr>
      <div class="signature-line"></div>
      <p>Unit President Showkat Ahmad Mir</p>
      <p class="quote">"Whoever feeds a fasting person will have a reward like that of the fasting person, without diminishing their reward in any way." - Prophet Muhammad (SAW)</p>
      <p class="thank-you">Thank you for your generous contribution!</p>
    </div>
  `;
  document.body.appendChild(tempDiv);

  const element = tempDiv.querySelector('.receipt-content');
  const blob = await generatePDF(element, receiptData.receiptNumber);
  const file = new File([blob], `Receipt_${receiptData.receiptNumber}.pdf`, { type: 'application/pdf' });

  // Automatically download the PDF
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Receipt_${receiptData.receiptNumber}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Share the PDF using Web Share API
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    navigator.share({
      files: [file],
      title: `Receipt ${receiptData.receiptNumber}`,
      text: `Here is your donation receipt for Zakatul Fitr (Receipt Number: ${receiptData.receiptNumber}).`
    }).catch(err => {
      console.error("Error sharing via Web Share API:", err);
    });
  } else {
    console.log("Web Share API not supported. File has been downloaded.");
  }
  URL.revokeObjectURL(url);
  document.body.removeChild(tempDiv);
};

// Receipt Section Logic
const receiptSection = document.getElementById('receipt-section');
const passwordPrompt = document.getElementById('password-prompt');
const receiptForm = document.getElementById('receipt-form');
const receiptPreview = document.getElementById('receipt-preview');

document.querySelectorAll('.get-receipt').forEach(btn => {
  btn.addEventListener('click', () => {
    console.log("Get Receipt button clicked");
    const org = btn.getAttribute('data-org');
    receiptSection.style.display = 'block';
    passwordPrompt.style.display = 'block';
    receiptForm.style.display = 'none';
    receiptPreview.style.display = 'none';
    receiptSection.scrollIntoView({ behavior: 'smooth' });
  });
});

document.getElementById("submit-password").addEventListener("click", () => {
  console.log("Submit password button clicked");
  const enteredPassword = document.getElementById("password").value;
  const receiptGiver = document.getElementById("receipt-giver").value.trim();
  const mobileNumber = document.getElementById("mobile-number").value.trim();

  if (!receiptGiver) {
    alert("Please enter the receipt giver's name");
    return;
  }

  if (!mobileNumber || mobileNumber.length !== 12 || !mobileNumber.startsWith("91")) {
    alert("Please enter a valid Indian mobile number with country code (e.g., 916005317824)");
    return;
  }

  if (enteredPassword !== SECRET_PASSWORD) {
    alert("Incorrect password");
    return;
  }

  console.log("Password validated successfully, proceeding to receipt form...");
  passwordPrompt.style.display = "none";
  receiptForm.style.display = "block";

  // Store the receipt giver's name and mobile number for later use
  receiptForm.dataset.receiptGiver = receiptGiver;
  receiptForm.dataset.mobileNumber = mobileNumber;
});

document.getElementById("generate-receipt").addEventListener("click", () => {
  console.log("Generate Receipt button clicked");
  const donorName = document.getElementById("donor-name").value;
  const amount = document.getElementById("amount").value;
  const purpose = document.getElementById("purpose").value;
  const receiptGiver = receiptForm.dataset.receiptGiver;
  const mobileNumber = receiptForm.dataset.mobileNumber;

  if (!donorName || !amount || !purpose) {
    alert("Please fill all fields");
    console.log("Validation failed: Missing fields", { donorName, amount, purpose });
    return;
  }

  console.log("Form validated, generating receipt content...");
  const orgName = "Zakatul Fitr";
  const prefix = "ZFTR";
  const counterKey = `${prefix}_counter`;
  let counter = parseInt(localStorage.getItem(counterKey) || "0", 10) + 1;
  localStorage.setItem(counterKey, counter);
  const receiptNumber = `${prefix}${counter}`;
  const receiptDate = new Date().toLocaleDateString();

  const receiptContent = `
    <div class="receipt-content">
      <h2>${orgName}</h2>
      <h3>Donation Receipt</h3>
      <p>Address: Cherwan Kangan, 191202</p>
      <p>Phone: 6006254589, 9622000919</p>
      <hr>
      <p><strong>Receipt No:</strong> ${receiptNumber}</p>
      <p><strong>Date:</strong> ${receiptDate}</p>
      <hr>
      <p><strong>Received From:</strong> ${donorName}</p>
      <p><strong>Amount:</strong> Rs.${amount}</p>
      <p><strong>Purpose:</strong> ${purpose}</p>
      <hr>
      <div class="signature-line"></div>
      <p>Unit President Showkat Ahmad Mir</p>
      <p class="quote">"Whoever feeds a fasting person will have a reward like that of the fasting person, without diminishing their reward in any way." - Prophet Muhammad (SAW)</p>
      <p class="thank-you">Thank you for your generous contribution!</p>
    </div>
  `;

  console.log("Rendering receipt content...");
  receiptPreview.innerHTML = receiptContent;
  receiptPreview.style.display = "block";

  // Save receipt to Firestore
  const receiptData = {
    receiptNumber: receiptNumber,
    donorName: donorName,
    amount: amount,
    purpose: purpose,
    date: receiptDate,
    receiptGiver: receiptGiver,
    mobileNumber: mobileNumber
  };

  // Function to generate PDF using html2canvas and jsPDF
  const generatePDF = async (element, receiptNumber) => {
    console.log("Generating PDF for receipt:", receiptNumber);
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      console.log("Canvas generated:", canvas);
      const imgData = canvas.toDataURL('image/png');
      console.log("Image data generated:", imgData.substring(0, 50) + "...");
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      const blob = pdf.output('blob');
      console.log("PDF blob generated:", blob);
      return blob;
    } catch (err) {
      console.error("Error generating PDF:", err);
      throw err;
    }
  };

  const downloadAndShareButton = document.createElement("button");
  downloadAndShareButton.textContent = "Download & Share Receipt";
  downloadAndShareButton.addEventListener("click", () => {
    console.log("Download & Share Receipt button clicked");
    const element = document.querySelector('#receipt-preview .receipt-content');
    if (!element) {
      console.error("Receipt content element not found");
      return;
    }
    generatePDF(element, receiptNumber).then(blob => {
      // Automatically download the PDF
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Receipt_${receiptNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      console.log("PDF downloaded");

      // Save to Firestore after successful download
      saveReceiptToFirestore(receiptData);

      // Share the PDF using Web Share API
      const file = new File([blob], `Receipt_${receiptNumber}.pdf`, { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: `Receipt ${receiptNumber}`,
          text: `Here is your donation receipt for ${orgName} (Receipt Number: ${receiptNumber}).`
        }).catch(err => {
          console.error("Error sharing via Web Share API:", err);
        });
      } else {
        console.log("Web Share API not supported. File has been downloaded.");
      }
      URL.revokeObjectURL(url);
    }).catch(err => {
      console.error("Error generating PDF:", err);
    });
  });

  console.log("Appending Download & Share button to receipt preview...");
  receiptPreview.appendChild(downloadAndShareButton);
});