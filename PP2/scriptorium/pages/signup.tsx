import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../pages/contexts/auth_context';
import Link from 'next/link';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
      setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

       if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      login(data.accessToken);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value,
      }))
    };
// ...prev does a shallow copy of the previous state and then updates the value of the input field that was changed.

    return (

<div className="min-h-screen flex items-center justify-center bg-navy">
      <div className="max-w-md w-full space-y-8 p-8 bg-navy/50 rounded-lg border border-gold/30">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gold">Create your account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-center">{error}</div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <input
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gold/30 bg-navy text-white focus:outline-none focus:ring-gold focus:border-gold focus:z-10 sm:text-sm"
              placeholder="First Name"
            />
            <input
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-2 border border-gold/30 bg-navy text-white focus:outline-none focus:ring-gold focus:border-gold focus:z-10 sm:text-sm"
              placeholder="Last Name"
            />
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-2 border border-gold/30 bg-navy text-white focus:outline-none focus:ring-gold focus:border-gold focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-2 border border-gold/30 bg-navy text-white focus:outline-none focus:ring-gold focus:border-gold focus:z-10 sm:text-sm"
              placeholder="Phone (optional)"
            />
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gold/30 bg-navy text-white focus:outline-none focus:ring-gold focus:border-gold focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-navy bg-gold hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold"
            >
              Sign up
            </button>
          </div>

          <div className="text-center">
            <Link href="/login" className="text-gold hover:text-gold/80">
              Already have an account? Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );


} 