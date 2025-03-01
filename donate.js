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

// Receipt Section Logic
const receiptSection = document.getElementById('receipt-section');
const passwordPrompt = document.getElementById('password-prompt');
const receiptForm = document.getElementById('receipt-form');
const receiptPreview = document.getElementById('receipt-preview');
const password = "123456"; // Default password

document.querySelectorAll('.get-receipt').forEach(btn => {
  btn.addEventListener('click', () => {
    const org = btn.getAttribute('data-org');
    receiptSection.style.display = 'block';
    passwordPrompt.style.display = 'block';
    receiptForm.style.display = 'none';
    receiptPreview.style.display = 'none';
    receiptSection.scrollIntoView({ behavior: 'smooth' });
  });
});

document.getElementById("submit-password").addEventListener("click", () => {
  const enteredPassword = document.getElementById("password").value;
  if (enteredPassword === password) {
    passwordPrompt.style.display = "none";
    receiptForm.style.display = "block";
  } else {
    alert("Incorrect password");
  }
});

document.getElementById("generate-receipt").addEventListener("click", () => {
  const donorName = document.getElementById("donor-name").value;
  const amount = document.getElementById("amount").value;
  const purpose = document.getElementById("purpose").value;
  let whatsappNumber = document.getElementById("whatsapp-number").value.trim();

  if (!donorName || !amount || !purpose || !whatsappNumber) {
    alert("Please fill all fields");
    return;
  }

  // Basic validation for WhatsApp number (assuming Indian numbers)
  if (!whatsappNumber.startsWith("91") || whatsappNumber.length !== 12) {
    alert("Please enter a valid Indian WhatsApp number with country code (e.g., 916005317824)");
    return;
  }

  const orgName = "Zakatul Fitr"; // Updated to Zakatul Fitr
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

  receiptPreview.innerHTML = receiptContent;
  receiptPreview.style.display = "block";

  const downloadButton = document.createElement("button");
  downloadButton.textContent = "Download Receipt";
  downloadButton.addEventListener("click", () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt ${receiptNumber}</title>
          <style>
            body { 
              font-family: 'Times New Roman', Times, serif; 
              margin: 20px; 
              text-align: center; 
            }
            .receipt-content { 
              border: 2px solid #006600; 
              padding: 20px; 
              max-width: 400px; 
              margin: 0 auto; 
              background: #fffef5; 
              font-size: 14px; 
              line-height: 1.5; 
              box-shadow: 0 4px 10px rgba(0,0,0,0.2); 
              position: relative; 
              background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0),
                                linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0);
              background-size: 20px 20px;
              background-position: 0 0, 10px 10px;
            }
            .receipt-content::before {
              content: '';
              position: absolute;
              top: -2px;
              left: -2px;
              right: -2px;
              bottom: -2px;
              border: 2px dashed #008000;
              pointer-events: none;
            }
            .receipt-content h2 { 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 5px; 
              color: #006600; 
              text-transform: uppercase; 
            }
            .receipt-content h3 { 
              font-size: 16px; 
              margin-bottom: 10px; 
              color: #333; 
              text-transform: uppercase; 
              border-bottom: 1px solid #006600; 
              padding-bottom: 5px; 
            }
            .receipt-content p { 
              margin: 5px 0; 
              font-size: 14px; 
              color: #333; 
            }
            .receipt-content hr { 
              border: 0; 
              border-top: 1px dashed #006600; 
              margin: 10px 0; 
            }
            .signature-line { 
              border-bottom: 1px solid #000; 
              width: 200px; 
              margin: 20px auto 5px; 
            }
            .quote { 
              font-style: italic; 
              font-size: 12px; 
              margin-top: 15px; 
              color: #555; 
              border-left: 3px solid #008000; 
              padding-left: 10px; 
            }
            .thank-you { 
              font-size: 12px; 
              margin-top: 5px; 
              color: #006600; 
              font-weight: bold; 
            }
          </style>
        </head>
        <body>
          ${receiptContent}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  });

  const shareButton = document.createElement("button");
  shareButton.textContent = "Share Receipt";
  shareButton.addEventListener("click", () => {
    const message = encodeURIComponent(`Here is your receipt for ${orgName} (Receipt Number: ${receiptNumber}):\nDonor Name: ${donorName}\nAmount: Rs. ${amount}\nPurpose: ${purpose}`);
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappLink, "_blank");
  });

  receiptPreview.appendChild(downloadButton);
  receiptPreview.appendChild(shareButton);
});