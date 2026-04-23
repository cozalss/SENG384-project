import { User, Briefcase, Building, Globe, MapPin } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const inputWrapperStyle = () => ({
    position: 'relative',
    transition: 'all 0.3s ease',
});

const iconStyle = (field, focusedField) => ({
    position: 'absolute',
    top: '50%',
    left: '16px',
    transform: 'translateY(-50%)',
    color: focusedField === field ? 'var(--primary-light)' : 'var(--text-subtle)',
    transition: 'color 0.3s ease',
});

const RegisterFormFields = ({ visible, formData, setFormData, focusedField, setFocusedField }) => {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'hidden' }}
                >
                    <div style={inputWrapperStyle()}>
                        <User size={18} style={iconStyle('name', focusedField)} />
                        <input
                            id="name-input"
                            type="text"
                            placeholder="Full Name w/ Title (e.g. Dr. John Doe)"
                            className="input-lux"
                            style={{ paddingLeft: '44px' }}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                            required
                        />
                    </div>

                    <div style={inputWrapperStyle()}>
                        <Briefcase size={18} style={iconStyle('role', focusedField)} />
                        <select
                            id="role-select"
                            aria-label="Role"
                            className="input-lux"
                            style={{ paddingLeft: '44px', appearance: 'none', cursor: 'pointer', fontWeight: '500' }}
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            onFocus={() => setFocusedField('role')}
                            onBlur={() => setFocusedField(null)}
                        >
                            <option value="Healthcare Professional">Healthcare Professional</option>
                            <option value="Engineer">Engineer / Developer</option>
                        </select>
                        <div style={{ position: 'absolute', top: '50%', right: '16px', transform: 'translateY(-50%)', pointerEvents: 'none', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid var(--text-subtle)' }} />
                    </div>

                    <div style={inputWrapperStyle()}>
                        <Building size={18} style={iconStyle('institution', focusedField)} />
                        <input
                            id="institution-input"
                            type="text"
                            placeholder="Institution (e.g. University of Zurich)"
                            className="input-lux"
                            style={{ paddingLeft: '44px' }}
                            value={formData.institution}
                            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                            onFocus={() => setFocusedField('institution')}
                            onBlur={() => setFocusedField(null)}
                            required
                        />
                    </div>

                    <div className="create-post-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={inputWrapperStyle()}>
                            <Globe size={18} style={iconStyle('country', focusedField)} />
                            <input
                                id="country-input"
                                type="text"
                                placeholder="Country"
                                className="input-lux"
                                style={{ paddingLeft: '44px' }}
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                onFocus={() => setFocusedField('country')}
                                onBlur={() => setFocusedField(null)}
                                required
                            />
                        </div>
                        <div style={inputWrapperStyle()}>
                            <MapPin size={18} style={iconStyle('city', focusedField)} />
                            <input
                                id="city-input"
                                type="text"
                                placeholder="City"
                                className="input-lux"
                                style={{ paddingLeft: '44px' }}
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                onFocus={() => setFocusedField('city')}
                                onBlur={() => setFocusedField(null)}
                                required
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RegisterFormFields;
