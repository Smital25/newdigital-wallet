import React, { useState } from "react";
import "../styles/Register.css";
import gifSrc from "../assets/finance.gif";

export default function FinanceRegisterPage() {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    mobile: "",
    email: "",
    idType: "",
    idNumber: "",
    idProof: null,
    username: "",
    password: "",
    confirmPassword: "",
    securityQuestion: "",
    securityAnswer: "",
    transactionPin: "",
    accountType: "",
    depositAmount: "",
    currency: "INR",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep = () => {
    let newErrors = {};
    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = "Full name is required.";
      if (!formData.dob) {
        newErrors.dob = "Date of birth is required.";
      } else {
        const birthDate = new Date(formData.dob);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          age < 18 ||
          (age === 18 && monthDiff < 0) ||
          (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          newErrors.dob = "You must be at least 18 years old to register.";
        }
      }
      if (!formData.gender) newErrors.gender = "Please select a gender.";
      if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Enter a valid 10-digit mobile number.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Enter a valid email address.";
    } else if (step === 2) {
      if (!formData.idType) newErrors.idType = "Please select an ID type.";
      if (!formData.idNumber.trim()) newErrors.idNumber = "ID number is required.";
      if (!formData.idProof) newErrors.idProof = "Please upload an ID proof.";
      else if (!/\.(jpg|jpeg|png|pdf)$/i.test(formData.idProof.name)) {
        newErrors.idProof = "Allowed formats: JPG, PNG, or PDF.";
      }
    } else if (step === 3) {
      if (!formData.username.trim()) newErrors.username = "Username is required.";
      if (
        formData.password.length < 6 ||
        !/[0-9]/.test(formData.password) ||
        !/[a-zA-Z]/.test(formData.password)
      ) {
        newErrors.password = "Password must be at least 6 characters and include letters and numbers.";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
      if (!formData.securityQuestion) newErrors.securityQuestion = "Select a security question.";
      if (!formData.securityAnswer.trim()) newErrors.securityAnswer = "Security answer is required.";
      if (!/^\d{4}$/.test(formData.transactionPin)) newErrors.transactionPin = "Transaction PIN must be exactly 4 digits.";
    } else if (step === 4) {
      if (!formData.accountType) newErrors.accountType = "Please select an account type.";
      if (formData.depositAmount && Number(formData.depositAmount) < 0) {
        newErrors.depositAmount = "Deposit amount cannot be negative.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => Math.min(4, s + 1));
  };

  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    try {
      setLoading(true);

      // Convert formData to FormData for file upload
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        // Ensure depositAmount is a number
        if (key === "depositAmount") {
          data.append(key, value ? Number(value) : 0);
        } else {
          data.append(key, value);
        }
      });

      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (!res.ok) {
        alert(result.message || "Registration failed");
      } else {
        alert("✅ Registration successful!");
        setStep(1);
        setFormData({
          fullName: "",
          dob: "",
          gender: "",
          mobile: "",
          email: "",
          idType: "",
          idNumber: "",
          idProof: null,
          username: "",
          password: "",
          confirmPassword: "",
          securityQuestion: "",
          securityAnswer: "",
          transactionPin: "",
          accountType: "",
          depositAmount: "",
          currency: "INR",
        });
        setErrors({});
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("❌ Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="navbar">
        <a className="navbar-logo" href="/">💰 Digital Wallet Tracker</a>
        <div className="navbar-links">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/contact">Contact Us</a>
        </div>
      </nav>

      <main className="page-content">
        <div className="finance-card">
          <div className="finance-card-left" aria-hidden>
            <img src={gifSrc} alt="Finance illustration" className="finance-gif" />
          </div>

          <div className="finance-card-right">
            <div className="form-card">
              <h2>Create SmartKid Bank Account</h2>

              <div className="step-indicator">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className={`dot ${step >= n ? "active" : ""}`}>{n}</div>
                ))}
              </div>

              {/* Step 1 */}
              {step === 1 && (
                <form>
                  <input name="fullName" placeholder="Full name" value={formData.fullName} onChange={handleChange} />
                  {errors.fullName && <p className="error">{errors.fullName}</p>}

                  <input name="dob" type="date" value={formData.dob} onChange={handleChange} />
                  {errors.dob && <p className="error">{errors.dob}</p>}

                  <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="">Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                  {errors.gender && <p className="error">{errors.gender}</p>}

                  <input name="mobile" placeholder="Mobile number" value={formData.mobile} onChange={handleChange} />
                  {errors.mobile && <p className="error">{errors.mobile}</p>}

                  <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                  {errors.email && <p className="error">{errors.email}</p>}

                  <button type="button" className="btn-green" onClick={nextStep}>Next →</button>
                </form>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <form>
                  <select name="idType" value={formData.idType} onChange={handleChange}>
                    <option value="">Select ID type</option>
                    <option>Aadhaar</option>
                    <option>PAN</option>
                    <option>Passport</option>
                    <option>Voter ID</option>
                  </select>
                  {errors.idType && <p className="error">{errors.idType}</p>}

                  <input name="idNumber" placeholder="ID number" value={formData.idNumber} onChange={handleChange} />
                  {errors.idNumber && <p className="error">{errors.idNumber}</p>}

                  <label>Upload ID proof</label>
                  <input name="idProof" type="file" accept="image/*,application/pdf" onChange={handleChange} />
                  {errors.idProof && <p className="error">{errors.idProof}</p>}

                  <div className="form-nav">
                    <button type="button" className="btn-secondary" onClick={prevStep}>← Back</button>
                    <button type="button" className="btn-green" onClick={nextStep}>Next →</button>
                  </div>
                </form>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <form>
                  <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} />
                  {errors.username && <p className="error">{errors.username}</p>}

                  <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} />
                  {errors.password && <p className="error">{errors.password}</p>}

                  <input name="confirmPassword" type="password" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} />
                  {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}

                  <select name="securityQuestion" value={formData.securityQuestion} onChange={handleChange}>
                    <option value="">Security question</option>
                    <option>Your mother's maiden name?</option>
                    <option>Your first school?</option>
                    <option>Your favorite teacher?</option>
                  </select>
                  {errors.securityQuestion && <p className="error">{errors.securityQuestion}</p>}

                  <input name="securityAnswer" placeholder="Security answer" value={formData.securityAnswer} onChange={handleChange} />
                  {errors.securityAnswer && <p className="error">{errors.securityAnswer}</p>}

                  <input name="transactionPin" type="password" placeholder="Transaction PIN (4 digits)" value={formData.transactionPin} onChange={handleChange} />
                  {errors.transactionPin && <p className="error">{errors.transactionPin}</p>}

                  <div className="form-nav">
                    <button type="button" className="btn-secondary" onClick={prevStep}>← Back</button>
                    <button type="button" className="btn-green" onClick={nextStep}>Next →</button>
                  </div>
                </form>
              )}

              {/* Step 4 */}
              {step === 4 && (
                <form onSubmit={handleSubmit}>
                  <select name="accountType" value={formData.accountType} onChange={handleChange}>
                    <option value="">Account type</option>
                    <option>Savings</option>
                    <option>Junior</option>
                    <option>Investment</option>
                  </select>
                  {errors.accountType && <p className="error">{errors.accountType}</p>}

                  <input
                    name="depositAmount"
                    type="number"
                    placeholder="Initial deposit (optional)"
                    value={formData.depositAmount}
                    onChange={handleChange}
                  />
                  {errors.depositAmount && <p className="error">{errors.depositAmount}</p>}

                  <select name="currency" value={formData.currency} onChange={handleChange}>
                    <option>INR</option>
                    <option>USD</option>
                    <option>EUR</option>
                  </select>

                  <div className="form-nav">
                    <button type="button" className="btn-secondary" onClick={prevStep}>← Back</button>
                    <button type="submit" className="btn-green" disabled={loading}>
                      {loading ? "Registering..." : "✅ Register"}
                    </button>
                  </div>
                </form>
              )}

              <p className="login-text">
                Already have account? <a className="login-link" href="/login">Log in</a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
