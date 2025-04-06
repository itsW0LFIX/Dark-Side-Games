// Settings info badges
document.addEventListener("DOMContentLoaded", function () {
  // Info data for each setting group
  const settingsInfo = {
    "animation-style": {
      type: "info",
      title: "نمط الحركة",
      description:
        "اختر كيفية تحرك الأسماء أثناء عملية الاختيار. يوفر كل نمط تأثيرًا بصريًا مختلفًا عند اختيار الفائز.",
    },
    "multiple-winners": {
      type: "info",
      title: "عدة فائزين",
      description:
        "اختر أكثر من فائز في نفس الوقت. مفيد لتكوين فرق أو مجموعات بسرعة.",
    },
    "weighted-selection": {
      type: "info",
      title: "اختيار مرجّح",
      description:
        "تعديل نسبة ختيار الإسم بنسبة لا تقل على 0.1 ولا تزيد عن  أضعاف النسبه 10 عن طريق نقر مرتين على أي اسم",
    },
    "theme-selection": {
      type: "info",
      title: "Theme Selection",
      description:
        "اختر مشاهد خاصًا للاحتفالات عند اختيار الفائز و عند الإختيار. كل مشهد يحتوي على تأثيرات بصرية مميزة.",
    },
    "custom-background": {
      type: "info",
      title: "خلفية مخصصة",
      description:
        "يسمح لك بيتغير الخلفيه بي خلفيات جاهزة أو من حاسوبك ",
    },
    "name-exclusion": {
      type: "info",
      title: "استبعاد الأسماء",
      description:
        "اوقف شي سميات باش مايتعاودوش يتختارو. مزيان باش كلشي ياخد نوبتو قبل ما يرجع يتعاود.(عند التفعيل و ختيار مده الزمنيه عند ختيار اسم عشوائى لن يتم إختياره مجددا إلى بعد نفاد الوقت المختار ويمكنك إزالة الأسماء المحميه من الختيار )",
    },
  };

  // Apply info badges to setting groups
  const settingGroups = document.querySelectorAll(".setting-group");

  settingGroups.forEach((group, index) => {
    // Create a data attribute for identification
    const headingText = group
      .querySelector("h4")
      .textContent.toLowerCase()
      .replace(/\s+/g, "-");
    group.dataset.settingId = headingText;

    // Check if we have info for this setting
    if (settingsInfo[headingText]) {
      const info = settingsInfo[headingText];

      // Add appropriate class based on type
      if (info.type === "new") {
        group.classList.add("new");
      } else if (info.type === "locked") {
        group.classList.add("locked");
      } else {
        group.classList.add("info-badge");
      }

      // Create tooltip
      const tooltip = document.createElement("div");
      tooltip.classList.add("info-tooltip");
      tooltip.innerHTML = `<strong>${info.title}</strong><br>${info.description}`;

      group.appendChild(tooltip);

      // Add click event for tooltip toggle
      group.addEventListener("click", function (e) {
        // Check if the click was on the badge (::after content)
        const rect = group.getBoundingClientRect();
        const isInBadgeArea =
          e.clientX > rect.right - 30 &&
          e.clientX < rect.right &&
          e.clientY > rect.top &&
          e.clientY < rect.top + 40;

        if (isInBadgeArea) {
          tooltip.style.display =
            tooltip.style.display === "block" ? "none" : "block";
          e.stopPropagation(); // Prevent other click handlers
        }
      });
    }
  });

  // Hide tooltips when clicking elsewhere
  document.addEventListener("click", function () {
    document.querySelectorAll(".info-tooltip").forEach((tooltip) => {
      tooltip.style.display = "none";
    });
  });
});
