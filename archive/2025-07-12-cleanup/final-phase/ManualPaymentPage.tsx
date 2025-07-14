import ManualPaymentFlow from '../../components/payments/ManualPaymentFlow';

const ManualPaymentPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manual Payment
          </h1>
          <p className="text-gray-600">
            Complete your payment through bank transfer and upload proof for verification
          </p>
        </div>
        
        <ManualPaymentFlow />
      </div>
    </div>
  );
};

export default ManualPaymentPage;
