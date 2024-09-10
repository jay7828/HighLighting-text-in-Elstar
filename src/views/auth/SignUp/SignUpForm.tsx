import { useState } from 'react';
import { FormItem, FormContainer } from '@/components/ui/Form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import PasswordInput from '@/components/shared/PasswordInput';
import ActionLink from '@/components/shared/ActionLink';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage';
import type { CommonProps } from '@/@types/common';
import { confirmSignUp, resendSignUpCode, signUp } from 'aws-amplify/auth'; // Removed confirmSignUp import
// Import VerificationCodeMail form
import VerificationCodeMail from '../VerificationCodeForm'; 
import VerificationCodeForm from '../VerificationCodeForm';
import { useNavigate } from 'react-router-dom';

interface SignUpFormProps extends CommonProps {
  disableSubmit?: boolean;
  signInUrl?: string;
}

type SignUpFormSchema = {
  userName: string;
  password: string;
  confirmPassword: string;
};

const validationSchema = Yup.object().shape({
  userName: Yup.string().required('Please enter your user name'),
  password: Yup.string()
    .required('Please enter your password')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/\d/, 'Password must contain at least one number'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Your passwords do not match')
    .required('Please confirm your password'),
});

const SignUpForm = (props: SignUpFormProps) => {
  const { disableSubmit = false, className, signInUrl = '/sign-in' } = props;
  const [message, setMessage] = useTimeOutMessage();
  const [verificationStep, setVerificationStep] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  const onSignUp = async (
    userName: string,
    password: string,
    setMessage: (msg: string) => void,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    try {
      console.log('Attempting to sign up with:', { userName, password });

      const result = await signUp({
        username: userName,
        password,
        options: {
          userAttributes: {
            email: '', // Optional: Provide email if required
            phone_number: '+15555555555',
          } // Example phone number, adjust if needed
        },
      });

      console.log('Sign-up result:', result);

      if (result.isSignUpComplete) {
        setMessage('Your account is already confirmed. You can sign in.');
      } else {
        setUserName(userName);
        setVerificationStep(true);
        setMessage('Account created successfully! Please check your email for the verification code.');
      }
    } catch (error: any) {
      console.error('Error during sign-up:', error);
      setMessage(error.message || 'Error during sign-up, please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  const onResendCode = async () => {
    if (userName) {
      try {
        await resendSignUpCode({ username: userName });
        setMessage('Verification code sent again. Please check your email.');
      } catch (error: any) {
        console.error('Error during code resend:', error);
        setMessage(error.message || 'Error during code resend, please try again.');
      }
    }
  };
  const navigate = useNavigate(); // Use the useNavigate hook
  const onConfirmCode = async (code: string) => {
    if (userName) {
      try {
        await confirmSignUp({ username: userName, confirmationCode: code });
        setMessage('Email confirmed successfully! Redirecting to sign-in...');
        setTimeout(() => {
          navigate('/sign-in');
        }, 2000);
      } catch (error: any) {
        console.error('Error during code confirmation:', error);
        setMessage(error.message || 'Error during code confirmation, please try again.');
      }
    }
  };

  return (
    <div className={className}>
      {message && (
        <Alert showIcon className="mb-4" type="danger">
          {message}
        </Alert>
      )}
      {!verificationStep ? (
        <Formik
          initialValues={{
            userName: '',
            password: '',
            confirmPassword: '',
          }}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting }) => {
            if (!disableSubmit) {
              onSignUp(values.userName, values.password, setMessage, setSubmitting);
            } else {
              setSubmitting(false);
            }
          }}
        >
          {({ touched, errors, isSubmitting }) => (
            <Form>
              <FormContainer>
                <FormItem
                  label="User Name"
                  invalid={errors.userName && touched.userName}
                  errorMessage={errors.userName}
                >
                  <Field
                    type="text"
                    autoComplete="off"
                    name="userName"
                    placeholder="User Name"
                    component={Input}
                  />
                </FormItem>
                <FormItem
                  label="Password"
                  invalid={errors.password && touched.password}
                  errorMessage={errors.password}
                >
                  <Field
                    autoComplete="off"
                    name="password"
                    placeholder="Password"
                    component={PasswordInput}
                  />
                </FormItem>
                <FormItem
                  label="Confirm Password"
                  invalid={errors.confirmPassword && touched.confirmPassword}
                  errorMessage={errors.confirmPassword}
                >
                  <Field
                    autoComplete="off"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    component={PasswordInput}
                  />
                </FormItem>
                <Button
                  block
                  loading={isSubmitting}
                  variant="solid"
                  type="submit"
                >
                  {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                </Button>
                <div className="mt-4 text-center">
                  <span>Already have an account? </span>
                  <ActionLink to={signInUrl}>Sign in</ActionLink>
                </div>
              </FormContainer>
            </Form>
          )}
        </Formik>
      ) : (
        <VerificationCodeForm
          userName={userName}
          onResendCode={onResendCode}
          onConfirmCode={onConfirmCode}
          setMessage={setMessage}
          setSubmitting={() => {}}
        />
      )}
    </div>
  );
};

export default SignUpForm;
