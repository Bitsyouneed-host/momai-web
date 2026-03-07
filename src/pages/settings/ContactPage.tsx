import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, Globe } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';

export default function ContactPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/settings')} className="p-2 hover:bg-white/50 rounded-xl">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <h1 className="text-2xl font-bold text-text-primary">Contact Us</h1>
      </div>

      <GlassCard>
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Mail size={28} className="text-primary-deep" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">Get in Touch</h2>
          <p className="text-sm text-text-secondary mt-1">We&apos;d love to hear from you</p>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="space-y-4">
          <a href="mailto:support@bitsyouneed.com" className="flex items-center gap-3 text-sm text-text-primary hover:text-primary-deep">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Mail size={18} className="text-primary-deep" />
            </div>
            <div>
              <div className="font-medium">Email Support</div>
              <div className="text-xs text-text-secondary">support@bitsyouneed.com</div>
            </div>
          </a>

          <div className="flex items-center gap-3 text-sm text-text-primary">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin size={18} className="text-primary-deep" />
            </div>
            <div>
              <div className="font-medium">Location</div>
              <div className="text-xs text-text-secondary">Denver, Colorado, United States</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-text-primary">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Globe size={18} className="text-primary-deep" />
            </div>
            <div>
              <div className="font-medium">Company</div>
              <div className="text-xs text-text-secondary">Blakes IT Solutions LLC</div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
