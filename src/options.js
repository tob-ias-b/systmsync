// Saves options to chrome.storage
const saveOptions = () => {
  const deleteMode = document.getElementById('deleteMode').value;
  const preferOutdoor = document.getElementById('preferOutdoor').value;
  const intervals_athleteid = document.getElementById('intervals_athleteid').value;
  const intervals_apikey = document.getElementById('intervals_apikey').value;
  let formValid = true;
  
  if(deleteMode != "false" && deleteMode != "true"){
    document.getElementById('deletemode_error').innerText = 'Invalid delete mode';
    formValid = false;
  } else {
    document.getElementById('deletemode_error').innerText = '';
  }

  if(preferOutdoor != "false" && preferOutdoor != "true"){
    document.getElementById('preferoutdoor_error').innerText = 'Invalid prefer outdoor choice';
    formValid = false;
  } else {
    document.getElementById('preferoutdoor_error').innerText = '';
  }

  if(intervals_athleteid.length < 1) {
    document.getElementById('athleteid_error').innerText = 'Invalid athlete id';
    formValid = false;
  } else {
    document.getElementById('athleteid_error').innerText = '';
  }

  if(intervals_apikey.length < 1) {
    document.getElementById('apikey_error').innerText = 'Invalid api key';
    formValid = false;
  } else {
    document.getElementById('apikey_error').innerText = '';
  }

  if(formValid){
    chrome.storage.local.set(
      { deleteMode: deleteMode, preferOutdoor: preferOutdoor, intervals_athleteid: intervals_athleteid, intervals_apikey: intervals_apikey },
      () => {
        // Update status to let user know options were saved.
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(() => {
          status.textContent = '';
        }, 750);
      }
    );
 
  }
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.local.get(
    { deleteMode: false, preferOutdoor: false, intervals_athleteid: '', intervals_apikey: '' },
    (items) => {
      document.getElementById('deleteMode').value = items.deleteMode;
      document.getElementById('preferOutdoor').value = items.preferOutdoor;
      document.getElementById('intervals_athleteid').value = items.intervals_athleteid;
      document.getElementById('intervals_apikey').value = items.intervals_apikey;
    }
  );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
