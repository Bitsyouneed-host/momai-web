import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import StyledInput from '../../components/ui/StyledInput';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { useAuthStore } from '../../stores/authStore';
import { usersApi } from '../../api/users';

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setPhone(user.phone || '');
    setDateOfBirth(user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '');
    setStreet(user.address?.street || '');
    setCity(user.address?.city || '');
    setState(user.address?.state || '');
    setZipCode(user.address?.zipCode || '');
    setEmergencyName(user.emergencyContact?.name || '');
    setEmergencyPhone(user.emergencyContact?.phone || '');
    setEmergencyRelationship(user.emergencyContact?.relationship || '');
    setInsuranceProvider(user.insurance?.provider || '');
    setPolicyNumber(user.insurance?.policyNumber || '');
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data } = await usersApi.updateMe({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        address: { street, city, state, zipCode },
        emergencyContact: {
          name: emergencyName.trim() || undefined,
          phone: emergencyPhone.trim() || undefined,
          relationship: emergencyRelationship.trim() || undefined,
        },
        insurance: {
          hasInsurance: !!insuranceProvider.trim(),
          provider: insuranceProvider.trim() || undefined,
          policyNumber: policyNumber.trim() || undefined,
        },
      } as Record<string, unknown>);

      if (data.success && data.data) {
        setUser(data.data);
        toast.success('Profile updated');
      }
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/settings')} className="p-2 hover:bg-white/50 rounded-xl">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <h1 className="text-2xl font-bold text-text-primary">Profile</h1>
      </div>

      <GlassCard>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">Basic Info</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <StyledInput label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <StyledInput label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <StyledInput label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <StyledInput label="Date of Birth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">Address</h3>
        <div className="space-y-3">
          <StyledInput label="Street" value={street} onChange={(e) => setStreet(e.target.value)} />
          <div className="grid grid-cols-3 gap-3">
            <StyledInput label="City" value={city} onChange={(e) => setCity(e.target.value)} />
            <StyledInput label="State" value={state} onChange={(e) => setState(e.target.value)} />
            <StyledInput label="Zip" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">Emergency Contact</h3>
        <div className="space-y-3">
          <StyledInput label="Name" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />
          <StyledInput label="Phone" type="tel" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
          <StyledInput label="Relationship" value={emergencyRelationship} onChange={(e) => setEmergencyRelationship(e.target.value)} />
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">Insurance</h3>
        <div className="space-y-3">
          <StyledInput label="Provider" placeholder="e.g., Blue Cross" value={insuranceProvider} onChange={(e) => setInsuranceProvider(e.target.value)} />
          <StyledInput label="Policy Number" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} />
        </div>
      </GlassCard>

      <PrimaryButton onClick={handleSave} isLoading={isLoading}>
        Save Changes
      </PrimaryButton>
    </div>
  );
}
