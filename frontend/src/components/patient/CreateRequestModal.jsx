import { useState } from 'react';
import { X, Droplet, Calendar, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CreateRequestModal({ isOpen, onClose, onSubmit, bloodGroup }) {
  const [formData, setFormData] = useState({
    blood_group: bloodGroup || 'O+',
    quantity_units: 1,
    required_by_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
    urgency: 'normal',
    address_text: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-[#E4E4E7] animate-fade-in-up">
        <div className="bg-brand-50 p-6 flex justify-between items-center border-b border-[#E4E4E7]">
          <h2 className="text-xl font-bold flex items-center gap-2 text-brand-600">
            <Droplet className="h-5 w-5 fill-brand-600" />
            Request Blood
          </h2>
          <button onClick={onClose} className="hover:bg-brand-100 p-1.5 rounded-full transition-colors text-brand-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#52525B] flex items-center gap-1.5">
                <Droplet className="h-4 w-4 text-brand-500" /> Blood Group
              </label>
              <select 
                className="w-full h-11 px-3 rounded-lg border border-[#E4E4E7] bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none text-[#09090B]"
                value={formData.blood_group}
                onChange={e => setFormData({...formData, blood_group: e.target.value})}
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#52525B]">Units Required</label>
              <Input 
                type="number" min="1" max="5" 
                value={formData.quantity_units}
                onChange={e => setFormData({...formData, quantity_units: parseInt(e.target.value)})}
                className="h-11 bg-white border-[#E4E4E7] text-[#09090B] focus-visible:ring-brand-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#52525B] flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-brand-500" /> Required By Date
            </label>
            <Input 
              type="date" required
              value={formData.required_by_date}
              onChange={e => setFormData({...formData, required_by_date: e.target.value})}
              className="h-11 bg-white border-[#E4E4E7] text-[#09090B] focus-visible:ring-brand-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#52525B] flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand-500" /> Hospital/Location
            </label>
            <Input 
              placeholder="e.g. Apollo Hospital, Jubilee Hills, Hyderabad" required
              value={formData.address_text}
              onChange={e => setFormData({...formData, address_text: e.target.value})}
              className="h-11 bg-white border-[#E4E4E7] text-[#09090B] focus-visible:ring-brand-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#52525B] flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-amber-500" /> Urgency Level
            </label>
            <select 
              className="w-full h-11 px-3 rounded-lg border border-[#E4E4E7] bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none text-[#09090B]"
              value={formData.urgency}
              onChange={e => setFormData({...formData, urgency: e.target.value})}
            >
              <option value="normal">Normal (Routine Transfusion)</option>
              <option value="emergency">Emergency (Immediate)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#52525B]">Additional Notes</label>
            <Input 
              placeholder="Any specific instructions..." 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="h-11 bg-white border-[#E4E4E7] text-[#09090B] focus-visible:ring-brand-500"
            />
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-12 text-md font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-brand"
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Triggering AI Matching...</>
              ) : (
                'Submit Request & Find Donors'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
