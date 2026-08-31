class SmsService {
  async sendOtp(phone, otp) {
    throw new Error("Not implemented");
  }
}

class MockSmsService extends SmsService {
  async sendOtp(phone, otp) {
    console.log(`[MOCK SMS] OTP for ${phone}: ${otp}`);
  }
}

module.exports = {
  SmsService,
  MockSmsService,
};
