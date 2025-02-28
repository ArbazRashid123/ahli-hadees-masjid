// Function to update the masjid name
function updateMasjidName(lang) {
  const masjidNameElement = document.getElementById('masjid-name');
  const translations = {
    'en': "Jamia Ahli Hadees Mohammadia Masjid Cherwan",
    'ur': "جامعہ اہلی حدیث محمدیہ مسجد چروان",
    'ar': "جامع أهل الحديث المحمدية مسجد تشيروان"
  };
  if (masjidNameElement && translations[lang]) {
    masjidNameElement.textContent = translations[lang];
  }
}

// Hook into your existing language switcher
const originalChangeLanguage = window.changeLanguage; // Save the original function
window.changeLanguage = function(lang) {
  originalChangeLanguage(lang); // Call your existing function
  updateMasjidName(lang); // Update the masjid name
};

// Set default to English when page loads
window.onload = function() {
  updateMasjidName('en');
};