import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';
import Button from '@/components/ui/Button';

const SignOutButton = () => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await signOut();
            // Redirect to the sign-in page or reload the page
            navigate('/sign-in');
        } catch (error) {
            console.error('Error during sign-out:', error);
        }
    };

    return (
        <Button onClick={handleSignOut}>
            Sign Out
        </Button>
    );
};

export default SignOutButton;
