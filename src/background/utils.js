function getAgendaStartEndDateFromValues(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setDate(end.getDate() + 1);
  end.setMilliseconds(end.getMilliseconds() - 1);

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

function ftpValueToOutdoor(ftpValue) {
  if (ftpValue <= 0.5) return "30-50";
  if (ftpValue <= 0.75) return "51-75";
  if (ftpValue <= 0.91) return "76-91";
  if (ftpValue <= 1.01) return "92-101";
  return "102-108";
}

function calcFtpPercentFromWatts(ftp, watts) {
  if (!ftp || watts === 0) return 0;
  return Math.round((watts / ftp) * 100);
}
