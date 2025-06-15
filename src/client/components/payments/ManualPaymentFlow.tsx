import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Upload,
  Check,
  Clock,
  X,
  AlertCircle,
  Copy,
  Download,
  Banknote
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  credits: number;
  features: {
    maxStudies: number;
    maxParticipants: number;
    maxRecordingMinutes: number;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    customBranding: boolean;
  };
}

interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  iban: string;
  swiftCode?: string;
}

interface PaymentRequest {
  id: string;
  referenceNumber: string;
  amount: number;
  currency: string;
  bankDetails: BankDetails;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  verifiedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
}

const ManualPaymentFlow: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [bankDetails, setBankDetails] = useState<{ SAR: BankDetails; USD: BankDetails } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<'SAR' | 'USD'>('SAR');
  const [currentStep, setCurrentStep] = useState<'select' | 'payment' | 'upload' | 'confirmation'>('select');
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payments/plans', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlans(data.data.plans);
        setBankDetails(data.data.bankDetails);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setCurrentStep('payment');
  };

  const createPaymentRequest = async () => {
    if (!selectedPlan) return;

    try {
      setLoading(true);
      const response = await fetch('/api/payments/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          planType: selectedPlan.id,
          currency: selectedCurrency,
          paymentMethod: 'bank_transfer'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentRequest(data.data.paymentRequest);
        setCurrentStep('upload');
      }
    } catch (error) {
      console.error('Failed to create payment request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPaymentProof(file);
    }
  };

  const uploadPaymentProof = async () => {
    if (!paymentProof || !paymentRequest) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('paymentProof', paymentProof);

      const response = await fetch(`/api/payments/${paymentRequest.id}/proof`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        setCurrentStep('confirmation');
      }
    } catch (error) {
      console.error('Failed to upload payment proof:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const downloadInstructions = () => {
    const bankInfo = bankDetails?.[selectedCurrency];
    if (!bankInfo || !selectedPlan) return;

    const instructions = `
Payment Instructions - ResearchHub

Plan: ${selectedPlan.name}
Amount: ${selectedPlan.price} ${selectedCurrency}
Reference: ${paymentRequest?.referenceNumber}

Bank Details:
Account Name: ${bankInfo.accountName}
Account Number: ${bankInfo.accountNumber}
Bank Name: ${bankInfo.bankName}
IBAN: ${bankInfo.iban}
${bankInfo.swiftCode ? `SWIFT Code: ${bankInfo.swiftCode}` : ''}

Instructions:
1. Transfer the exact amount to the account above
2. Use the reference number in your transfer description
3. Upload your payment receipt/proof
4. Wait for admin verification (usually within 24 hours)

Important: Include the reference number "${paymentRequest?.referenceNumber}" in your transfer description for faster processing.
    `;

    const blob = new Blob([instructions], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-instructions-${paymentRequest?.referenceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && currentStep === 'select') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Banknote className="w-6 h-6 mr-3 text-blue-600" />
            Manual Payment Process
          </h2>
          <p className="text-gray-600 mt-2">
            Secure bank transfer payment for Saudi Arabia and international users
          </p>
          
          {/* Steps indicator */}
          <div className="flex items-center mt-6 space-x-4">
            {[
              { key: 'select', label: 'Select Plan', icon: CreditCard },
              { key: 'payment', label: 'Payment Details', icon: Banknote },
              { key: 'upload', label: 'Upload Proof', icon: Upload },
              { key: 'confirmation', label: 'Confirmation', icon: Check }
            ].map(({ key, label, icon: Icon }, index) => (
              <div key={key} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep === key 
                    ? 'bg-blue-600 text-white' 
                    : index < ['select', 'payment', 'upload', 'confirmation'].indexOf(currentStep)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep === key ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {label}
                </span>
                {index < 3 && (
                  <div className={`mx-4 h-0.5 w-8 ${
                    index < ['select', 'payment', 'upload', 'confirmation'].indexOf(currentStep)
                      ? 'bg-green-600'
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Plan Selection */}
          {currentStep === 'select' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`border rounded-lg p-6 cursor-pointer transition-all ${
                      selectedPlan?.id === plan.id
                        ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-blue-600">{plan.price}</span>
                      <span className="text-gray-600 ml-1">SAR/month</span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        {plan.credits.toLocaleString()} credits
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        {plan.features.maxStudies === -1 ? 'Unlimited' : plan.features.maxStudies} studies
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        {plan.features.maxParticipants === -1 ? 'Unlimited' : plan.features.maxParticipants} participants
                      </div>
                      {plan.features.advancedAnalytics && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          Advanced Analytics
                        </div>
                      )}
                      {plan.features.prioritySupport && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          Priority Support
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedPlan && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">Currency:</label>
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value as 'SAR' | 'USD')}
                      className="border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="SAR">SAR (Saudi Riyal)</option>
                      <option value="USD">USD (US Dollar)</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setCurrentStep('payment')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Continue to Payment
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Payment Details */}
          {currentStep === 'payment' && selectedPlan && bankDetails && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Instructions</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-blue-900">Important Instructions</h4>
                    <p className="text-blue-800 text-sm mt-1">
                      Please transfer the exact amount to our bank account and include the reference number in your transfer description for faster processing.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Payment Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-medium">{selectedPlan.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-bold text-lg">{selectedPlan.price} {selectedCurrency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Credits:</span>
                      <span className="font-medium">{selectedPlan.credits.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Bank Transfer Details</h4>
                  <div className="space-y-3">
                    {Object.entries(bankDetails[selectedCurrency]).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <div className="flex items-center">
                          <span className="font-medium mr-2">{value}</span>
                          <button
                            onClick={() => copyToClipboard(value)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep('select')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700"
                >
                  ← Back to Plans
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={downloadInstructions}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Instructions
                  </button>
                  <button
                    onClick={createPaymentRequest}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'I Have Made the Payment'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Upload Proof */}
          {currentStep === 'upload' && paymentRequest && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Payment Proof</h3>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-green-900">Payment Request Created</h4>
                    <p className="text-green-800 text-sm mt-1">
                      Reference Number: <strong>{paymentRequest.referenceNumber}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Upload Payment Receipt or Screenshot
                </h4>
                <p className="text-gray-600 mb-6">
                  Upload a clear image or PDF of your bank transfer receipt
                </p>
                
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="payment-proof"
                />
                <label
                  htmlFor="payment-proof"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </label>
                
                {paymentProof && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      Selected: {paymentProof.name} ({(paymentProof.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep('payment')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700"
                >
                  ← Back to Payment Details
                </button>
                <button
                  onClick={uploadPaymentProof}
                  disabled={!paymentProof || loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Uploading...' : 'Submit Payment Proof'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 'confirmation' && paymentRequest && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Payment Submitted Successfully!</h3>
              <p className="text-gray-600 mb-6">
                Your payment proof has been uploaded and is pending admin verification.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6 max-w-md mx-auto">
                <h4 className="font-semibold text-gray-900 mb-3">Reference Number</h4>
                <div className="flex items-center justify-center">
                  <code className="bg-white px-4 py-2 rounded border text-lg font-mono">
                    {paymentRequest.referenceNumber}
                  </code>
                  <button
                    onClick={() => copyToClipboard(paymentRequest.referenceNumber)}
                    className="ml-2 text-blue-600 hover:text-blue-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-6">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-4 h-4 mr-2" />
                  Verification usually takes 24-48 hours
                </div>
                <p>You will receive an email notification once your payment is verified.</p>
              </div>
              
              <button
                onClick={() => window.location.href = '/app/dashboard'}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManualPaymentFlow;
