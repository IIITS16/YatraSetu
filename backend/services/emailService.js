class EmailService {
  async sendOtp(email, otp) {
    throw new Error("Not implemented");
  }
}

class MockEmailService extends EmailService {
  async sendOtp(email, otp) {
    console.log(`[MOCK EMAIL] OTP for ${email}: ${otp}`);
  }
}

module.exports = {
  EmailService,
  MockEmailService,
};
