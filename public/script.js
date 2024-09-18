document.addEventListener('DOMContentLoaded', function () {
  const courseSelect = document.getElementById('course');
  const uvuIdInput = document.getElementById('uvuId');
  const logsUl = document.querySelector('ul[data-cy="logs"]');
  const addLogBtn = document.querySelector('button[data-cy="add_log_btn"]');
  const logTextarea = document.querySelector(
    'textarea[data-cy="log_textarea"]'
  );
  const uvuIdLabel = document.querySelector('label[for="uvuId"]');
  const uvuIdDisplay = document.getElementById('uvuIdDisplay');
  const newLogLabel = logTextarea.previousElementSibling;
  const modeSelect = document.getElementById('mode');

  // Dark/Light Mode Handling
  const userPref = localStorage.getItem('theme');
  console.log('User Pref:', userPref || 'unknown');

  const browserPref =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  console.log('Browser Pref:', browserPref);

  const osPref = browserPref; // Typically, browser and OS prefs are the same
  console.log('OS Pref:', osPref);

  const mode =
    userPref ||
    (window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light');
  applyMode(mode);
  modeSelect.value = mode;

  modeSelect.addEventListener('change', function () {
    const selectedMode = modeSelect.value;
    applyMode(selectedMode);
    localStorage.setItem('theme', selectedMode);
  });

  function applyMode(mode) {
    if (mode === 'dark') {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }

  // Handle course selection change
  courseSelect.addEventListener('change', function () {
    uvuIdInput.value = ''; // Clear the UVU ID input field
    logsUl.innerHTML = ''; // Clear the logs display
    uvuIdDisplay.style.display = 'none'; // Hide the logs display title
    addLogBtn.disabled = true; // Disable the Add Log button
    newLogLabel.style.display = 'none'; // Hide the New Log label
    logTextarea.style.display = 'none'; // Hide the textarea
    addLogBtn.style.display = 'none'; // Hide the Add Log button

    if (courseSelect.value) {
      uvuIdInput.style.display = 'block';
      uvuIdLabel.style.display = 'block';
    } else {
      uvuIdInput.style.display = 'none';
      uvuIdLabel.style.display = 'none';
    }
  });

  // Handle UVU ID input change
  uvuIdInput.addEventListener('input', function () {
    const uvuId = uvuIdInput.value.trim();
    if (uvuId.length === 8 && /^\d+$/.test(uvuId)) {
      fetchLogs(courseSelect.value, uvuId);
    } else {
      logsUl.innerHTML = '';
      uvuIdDisplay.style.display = 'none';
      addLogBtn.disabled = true;
    }
  });

  // Fetch logs based on selected course and UVU ID using Axios
  function fetchLogs(courseId, uvuId) {
    axios
      .get(`https://json-server-ft3qa5--3000.local.webcontainer.io/logs`, {
        params: {
          courseId: courseId,
          uvuId: uvuId,
        },
      })
      .then((response) => {
        const data = response.data;
        logsUl.innerHTML = '';
        uvuIdDisplay.style.display = 'block';
        document.getElementById('uvuIdText').textContent = uvuId;
        if (data.length > 0) {
          data.forEach((log) => {
            const li = document.createElement('li');
            li.innerHTML = `
                          <div><small>${new Date(
                            log.dateTime
                          ).toLocaleString()}</small></div>
                          <pre><p>${log.text}</p></pre>
                      `;
            li.addEventListener('click', function () {
              li.classList.toggle('active');
            });
            logsUl.appendChild(li);
          });
        } else {
          logsUl.innerHTML = '<li><p>No logs found.</p></li>';
        }

        // Show the "New Log" label, textarea, and button if logs are fetched
        newLogLabel.style.display = 'block';
        logTextarea.style.display = 'block';
        addLogBtn.style.display = 'block';
        addLogBtn.disabled = logTextarea.value.trim() === '';
      })
      .catch((error) => {
        console.error('Failed to fetch logs:', error);
        logsUl.innerHTML = '<li><p>No logs found or failed to load.</p></li>';
        addLogBtn.disabled = true;
      });
  }

  // Enable/disable Add Log button based on textarea content
  logTextarea.addEventListener('input', function () {
    addLogBtn.disabled =
      logTextarea.value.trim() === '' || logsUl.innerHTML === '';
  });

  // Handle Add Log form submission using Axios
  document.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault();
    const uvuId = uvuIdInput.value.trim();
    const courseId = courseSelect.value;
    const logText = logTextarea.value.trim();

    if (logText && courseId && uvuId) {
      axios
        .post(`https://json-server-ft3qa5--3000.local.webcontainer.io/logs`, {
          courseId: courseId,
          uvuId: uvuId,
          text: logText,
          dateTime: new Date().toISOString(),
        })
        .then((response) => {
          console.log('Log added:', response.data);
          fetchLogs(courseId, uvuId);
          logTextarea.value = ''; // Clear the textarea after adding the log
        })
        .catch((error) => {
          console.error('Error adding log:', error);
        });
    }
  });
});
