enum ExpiryOption {
    oneMinute = 60 * 1000,
    oneHour = 60 * 60 * 1000,
    oneMonth = 60 * 60 * 24 * 30 * 1000,
  }
  
  const generateExpiryDate = Object.assign(
    (option: ExpiryOption): Date => new Date(Date.now() + option),
    {
      oneMinute: () => new Date(Date.now() + ExpiryOption.oneMinute),
      oneHour: () => new Date(Date.now() + ExpiryOption.oneHour),
      oneMonth: () => new Date(Date.now() + ExpiryOption.oneMonth),
    }
  );
  
  export default generateExpiryDate;
  