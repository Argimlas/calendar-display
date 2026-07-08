const I18N_DICT = {
  header: {
    pageTitle: { de: "Raum Kalender", en: "Room Calendar" },
    title: { de: "Raumbelegung Werkstatt", en: "Workshop Room Booking" },
    refreshAriaLabel: { de: "Aktualisieren", en: "Refresh" },
    langToggleAriaLabel: {
      de: "Sprache auf Englisch wechseln",
      en: "Switch language to German",
    },
    helpBtn: { de: "Hilfe", en: "Help" },
  },

  common: {
    noTitle: { de: "Kein Titel", en: "No title" },
    cancel: { de: "Abbrechen", en: "Cancel" },
  },

  status: {
    free: { de: "FREI", en: "FREE" },
    occupied: { de: "BELEGT", en: "OCCUPIED" },
    loading: { de: "Lade Status...", en: "Loading status..." },
    occupiedDetail: { de: "{title} — bis {end}", en: "{title} — until {end}" },
    afterThat: { de: "Danach: {title} um {start}", en: "Then: {title} at {start}" },
    nextEvent: { de: "Nächster Termin: {title} um {start}", en: "Next event: {title} at {start}" },
    noMoreToday: { de: "Keine weiteren Termine heute", en: "No more events today" },
  },

  quickbook: {
    heading: { de: "Ab jetzt buchen", en: "Book from now" },
    titlePlaceholder: { de: "Titel eingeben", en: "Enter title" },
    duration30: { de: "30 min", en: "30 min" },
    duration60: { de: "1 h", en: "1 h" },
    duration90: { de: "1,5 h", en: "1.5 h" },
    duration120: { de: "2 h", en: "2 h" },
    duration180: { de: "3 h", en: "3 h" },
    duration240: { de: "4 h", en: "4 h" },
    duration360: { de: "6 h", en: "6 h" },
    duration480: { de: "8 h", en: "8 h" },
    duration720: { de: "12 h", en: "12 h" },
    duration1440: { de: "24 h", en: "24 h" },
    bookNow: { de: "Jetzt buchen", en: "Book now" },
    booking: { de: "Buche...", en: "Booking..." },
  },

  calendar: {
    monthNames: {
      de: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
      en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    },
    dayNames: {
      de: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
      en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    },
    dayAbbrMon: { de: "Mo", en: "Mon" },
    dayAbbrTue: { de: "Di", en: "Tue" },
    dayAbbrWed: { de: "Mi", en: "Wed" },
    dayAbbrThu: { de: "Do", en: "Thu" },
    dayAbbrFri: { de: "Fr", en: "Fri" },
    dayAbbrSat: { de: "Sa", en: "Sat" },
    dayAbbrSun: { de: "So", en: "Sun" },
    newEvent: { de: "+ Neuen Termin", en: "+ New event" },
    noEvents: { de: "Keine Termine", en: "No events" },
  },

  bookingModal: {
    heading: { de: "Termin reservieren", en: "Book appointment" },
    dateLabel: { de: "Datum", en: "Date" },
    startLabel: { de: "Start", en: "Start" },
    endLabel: { de: "Ende", en: "End" },
    titleLabel: { de: "Titel", en: "Title" },
    titlePlaceholder: { de: "z.B. Meeting", en: "e.g. Meeting" },
    recurring: { de: "Wiederkehrend", en: "Recurring" },
    frequency: { de: "Wiederholung", en: "Repeat" },
    daily: { de: "Täglich", en: "Daily" },
    weekly: { de: "Wöchentlich", en: "Weekly" },
    monthly: { de: "Monatlich", en: "Monthly" },
    until: { de: "Endet am", en: "Ends on" },
    submit: { de: "Reservieren", en: "Book" },
    reserving: { de: "Reserviere...", en: "Booking..." },
  },

  confirmModal: {
    noDelete: { de: "Ein Löschen ist nicht möglich.", en: "Cancellation is not possible." },
  },

  helpModal: {
    heading: { de: "Hilfe", en: "Help" },
    statusHeading: { de: "Status-Anzeige", en: "Status Display" },
    statusBody: {
      de: 'Zeigt den aktuellen Belegungsstatus des Raums. <strong class="text-green-400">Grün</strong> bedeutet der Raum ist frei, <strong class="text-red-400">Rot</strong> bedeutet er ist belegt. Daneben wird die aktuelle Uhrzeit angezeigt.',
      en: 'Shows the current occupancy status of the room. <strong class="text-green-400">Green</strong> means the room is free, <strong class="text-red-400">red</strong> means it is occupied. The current time is shown next to it.',
    },
    quickbookHeading: { de: "Schnellbuchung", en: "Quick Booking" },
    quickbookBody: {
      de: 'Wenn der Raum frei ist, kann hier sofort eine Buchung ab jetzt erstellt werden. Titel eingeben, gewünschte Dauer aus dem Dropdown wählen und „Jetzt buchen“ klicken.',
      en: 'If the room is free, a booking can be created here starting immediately. Enter a title, choose the desired duration from the dropdown, and click "Book now".',
    },
    calendarHeading: { de: "Kalender", en: "Calendar" },
    calendarBody: {
      de: "Die Monatsübersicht zeigt alle Termine des aktuellen Monats. Mit den Pfeilen kann zwischen Monaten navigiert werden. Ein Klick auf einen Tag öffnet die Tagesansicht mit allen Terminen.",
      en: "The month view shows all events for the current month. Use the arrows to navigate between months. Clicking on a day opens the day view with all events.",
    },
    dayViewHeading: { de: "Tagesansicht", en: "Day View" },
    dayViewBody: {
      de: 'Zeigt alle Termine des ausgewählten Tages im Detail. Über den Button „+ Neuen Termin“ kann ein neuer Termin für diesen Tag erstellt werden. Gebuchte Termine können nicht gelöscht werden.',
      en: 'Shows all events of the selected day in detail. Use the "+ New event" button to create a new event for this day. Booked events cannot be deleted.',
    },
    bookingHeading: { de: "Termin reservieren", en: "Book Appointment" },
    bookingBody: {
      de: 'Im Buchungsdialog werden Datum, Start- und Endzeit sowie ein Titel angegeben. Nach Klick auf „Reservieren“ wird der Termin im Google Kalender erstellt.',
      en: 'In the booking dialog, enter the date, start and end time, and a title. After clicking "Book", the event is created in Google Calendar.',
    },
    recurringHeading: { de: "Wiederkehrende Termine", en: "Recurring Events" },
    recurringBody: {
      de: 'Im Buchungsdialog kann die Option „Wiederkehrend“ aktiviert werden. Dann lässt sich ein Wiederholungsintervall (täglich, wöchentlich oder monatlich) sowie ein optionales Enddatum wählen. Der Termin wird dann als wiederkehrende Terminserie im Google Kalender erstellt.',
      en: 'In the booking dialog, you can enable the "Recurring" option. This lets you choose a repeat interval (daily, weekly, or monthly) as well as an optional end date. The event will then be created as a recurring series in Google Calendar.',
    },
  },

  vk: {
    label: { de: "Tastatur", en: "Keyboard" },
    placeholder: { de: "Text wird hier angezeigt...", en: "Text will be shown here..." },
  },

  booking: {
    roomOccupiedError: { de: "Raum ist belegt — Buchung nicht möglich", en: "Room is occupied — booking not possible" },
    quickConfirm: { de: "Sicher, dass du den Raum ab jetzt für {label} buchen willst?", en: "Are you sure you want to book the room from now for {label}?" },
    roomBookedSuccess: { de: "Raum gebucht für {label}", en: "Room booked for {label}" },
    bookingFailed: { de: "Buchung fehlgeschlagen", en: "Booking failed" },
    durationMinutes: { de: "{count} Minuten", en: "{count} Minutes" },
    durationHourSingle: { de: "1 Stunde", en: "1 Hour" },
    durationHoursMulti: { de: "{count} Stunden", en: "{count} Hours" },
    fillRequiredFields: { de: "Bitte alle Pflichtfelder ausfüllen", en: "Please fill in all required fields" },
    dateInPast: { de: "Datum darf nicht in der Vergangenheit liegen", en: "Date cannot be in the past" },
    startBeforeEnd: { de: "Startzeit muss vor Endzeit liegen", en: "Start time must be before end time" },
    minDuration: { de: "Mindestdauer: 15 Minuten", en: "Minimum duration: 15 minutes" },
    slotOccupied: { de: "Zeitraum ist bereits belegt", en: "Time slot is already booked" },
    recurrenceEndRequired: { de: "Bitte ein Enddatum für die Wiederholung angeben", en: "Please provide an end date for the recurrence" },
    recurrenceEndAfterStart: { de: "Enddatum der Wiederholung muss nach dem Startdatum liegen", en: "Recurrence end date must be after the start date" },
    confirmSingle: { de: "Sicher, dass du den Termin am {day}, {date}. {month} von {start} bis {end} Uhr buchen willst?", en: "Are you sure you want to book the appointment on {day}, {month} {date} from {start} to {end}?" },
    confirmRecurring: { de: "Sicher, dass du den Termin am {day}, {date}. {month} von {start} bis {end} Uhr {freq} bis zum {untilDate} buchen willst?", en: "Are you sure you want to book the appointment on {day}, {month} {date} from {start} to {end}, repeating {freq} until {untilDate}?" },
    freqDaily: { de: "täglich", en: "daily" },
    freqWeekly: { de: "wöchentlich", en: "weekly" },
    freqMonthly: { de: "monatlich", en: "monthly" },
    reservedSuccess: { de: "Termin erfolgreich reserviert", en: "Appointment successfully booked" },
    reservationFailed: { de: "Reservierung fehlgeschlagen", en: "Booking failed" },
  },
};

const I18n = {
  STORAGE_KEY: "lang",
  DEFAULT_LANG: "de",
  current: "de",
  dict: I18N_DICT,

  init() {
    this.current = localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT_LANG;
    document.documentElement.lang = this.current;
    this.applyStaticTranslations();
  },

  t(key, params) {
    const entry = key.split(".").reduce((o, k) => o && o[k], this.dict);
    if (!entry) {
      console.warn(`i18n: missing key "${key}"`);
      return key;
    }
    let value = entry[this.current] ?? entry[this.DEFAULT_LANG];
    if (typeof value === "string" && params) {
      value = value.replace(/\{(\w+)\}/g, (_, k) => (params[k] ?? `{${k}}`));
    }
    return value;
  },

  setLanguage(lang) {
    if (lang === this.current) return;
    this.current = lang;
    localStorage.setItem(this.STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    this.applyStaticTranslations();
    window.dispatchEvent(new CustomEvent("languagechange"));
  },

  toggle() {
    this.setLanguage(this.current === "de" ? "en" : "de");
  },

  applyStaticTranslations() {
    document.title = this.t("header.pageTitle");

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = this.t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      el.innerHTML = this.t(el.dataset.i18nHtml);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = this.t(el.dataset.i18nPlaceholder);
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
      el.setAttribute("aria-label", this.t(el.dataset.i18nAriaLabel));
    });

    const langBtn = document.getElementById("lang-toggle-btn");
    if (langBtn) langBtn.textContent = this.current.toUpperCase();
  },
};

window.I18n = I18n;
