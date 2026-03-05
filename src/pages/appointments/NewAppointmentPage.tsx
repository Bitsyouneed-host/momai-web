import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import StyledInput from '../../components/ui/StyledInput';
import StyledTextarea from '../../components/ui/StyledTextarea';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { appointmentsApi } from '../../api/appointments';

export default function NewAppointmentPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [providerName, setProviderName] = useState('');
  const [providerPhone, setProviderPhone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!startDate || !startTime) {
      toast.error('Start date and time are required');
      return;
    }

    const start = new Date(`${startDate}T${startTime}`);
    const end = endDate && endTime
      ? new Date(`${endDate}T${endTime}`)
      : new Date(start.getTime() + 60 * 60 * 1000); // Default 1 hour

    if (end <= start) {
      toast.error('End time must be after start time');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await appointmentsApi.create({
        title: title.trim(),
        description: description.trim() || undefined,
        providerName: providerName.trim() || undefined,
        providerPhone: providerPhone.trim() || undefined,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        notes: notes.trim() || undefined,
      });

      if (data.success) {
        toast.success('Appointment created');
        navigate('/appointments');
      } else {
        toast.error(data.message || 'Failed to create appointment');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to create appointment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/50 rounded-xl">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <h1 className="text-2xl font-bold text-text-primary">New Appointment</h1>
      </div>

      <GlassCard>
        <div className="space-y-4">
          <StyledInput
            label="Title *"
            placeholder="e.g., Dental Checkup"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <StyledTextarea
            label="Description"
            placeholder="Optional details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </GlassCard>

      <GlassCard>
        <div className="space-y-4">
          <StyledInput
            label="Provider Name"
            placeholder="e.g., Dr. Smith"
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
          />
          <StyledInput
            label="Phone Number"
            placeholder="(555) 123-4567"
            type="tel"
            value={providerPhone}
            onChange={(e) => setProviderPhone(e.target.value)}
          />
        </div>
      </GlassCard>

      <GlassCard>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StyledInput
              label="Start Date *"
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); if (!endDate) setEndDate(e.target.value); }}
              min={new Date().toISOString().split('T')[0]}
            />
            <StyledInput
              label="Start Time *"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StyledInput
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
            />
            <StyledInput
              label="End Time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <StyledTextarea
          label="Notes"
          placeholder="Additional notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </GlassCard>

      <PrimaryButton onClick={handleSubmit} isLoading={isLoading} disabled={!title.trim()}>
        Create Appointment
      </PrimaryButton>
    </div>
  );
}
