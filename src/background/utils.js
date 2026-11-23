function getAgendaStartEndDateFromValues(startDate, endDate) {
  let dateValue = new Date(startDate);
  const startDateParam = dateValue.toISOString();
  dateValue = new Date(endDate);
  dateValue.setDate(dateValue.getDate() + 1);
  dateValue.setMilliseconds(dateValue.getMilliseconds() - 1);
  const endDateParam = dateValue.toISOString();
  var p = {};
  p.startDate = startDateParam;
  p.endDate = endDateParam;
  return p;
}

function ftpValueToOutdoor(ftpValue) {
  let ftp_percent = 0;

  if (ftpValue <= 0.5) {
    ftp_percent = "30-50";
  } else if (ftpValue <= 0.75) {
    ftp_percent = "51-75";
  } else if (ftpValue <= 0.91) {
    ftp_percent = "76-91";
  } else if (ftpValue <= 1.01) {
    ftp_percent = "92-101";
  } else {
    ftp_percent = "102-108";
  }

  return ftp_percent;
}

function calcFtpPercentFromWatts(ftp, watts) {
  if (watts === 0) return 0;
  let ftp_percent = Math.round((watts / ftp) * 100);
  return ftp_percent;
}
