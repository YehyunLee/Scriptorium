import { useState, useEffect } from 'react';
import { useAuth } from '../pages/contexts/auth_context'
import { useRouter } from 'next/router';
import { UserProfile } from '@/types/auth';

export default function Profile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect( () => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchProfile();
    }, [isAuthenticated]);

// usually when useEffect takes paramter?:
// A. the function is called when the component mounts
// B. the function is called when the component updates
// C. the function is called when the component unmounts
// D. the function is called when the value of the parameter changes

// mounts means the component is rendered for the first time
// unmounts means the component is removed from the DOM

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            // is localStorage and cookie the same?
            // A. Yes

            // JWT auth method vs cookie auth method
        }
        catch (error: any) {}
        finally {}
    }
}