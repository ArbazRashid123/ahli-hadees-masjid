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

  if (!donorName || !amount || !purpose) {
    alert("Please fill all fields");
    return;
  }

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

  receiptPreview.innerHTML = receiptContent;
  receiptPreview.style.display = "block";

  // Function to generate PDF using html2canvas and jsPDF
  const generatePDF = async () => {
    const element = document.querySelector('#receipt-preview .receipt-content');
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    return pdf.output('blob');
  };

  const downloadAndShareButton = document.createElement("button");
  downloadAndShareButton.textContent = "Download & Share Receipt";
  downloadAndShareButton.addEventListener("click", () => {
    // Generate PDF
    generatePDF().then(blob => {
      // Create a File object from the blob
      const file = new File([blob], `Receipt_${receiptNumber}.pdf`, { type: 'application/pdf' });

      // Automatically download the PDF
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Receipt_${receiptNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Share the PDF using Web Share API
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: `Receipt ${receiptNumber}`,
          text: `Here is your donation receipt for ${orgName} (Receipt Number: ${receiptNumber}).`
        }).catch(err => {
          console.error("Error sharing via Web Share API:", err);
          // Fallback: Prompt user to share manually
          console.log("Sharing not supported. File has been downloaded.");
        });
      } else {
        // Fallback: Prompt user to share manually (without alert)
        console.log("Web Share API not supported. File has been downloaded.");
      }
      URL.revokeObjectURL(url);
    }).catch(err => {
      console.error("Error generating PDF:", err);
    });
  });

  receiptPreview.appendChild(downloadAndShareButton);
});
