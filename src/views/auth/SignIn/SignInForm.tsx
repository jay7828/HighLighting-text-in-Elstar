import { useNavigate } from 'react-router-dom';
import { confirmSignUp, resendSignUpCode, signIn, signOut } from 'aws-amplify/auth';
import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import { FormItem, FormContainer } from '@/components/ui/Form';
import Alert from '@/components/ui/Alert';
import PasswordInput from '@/components/shared/PasswordInput';
import ActionLink from '@/components/shared/ActionLink';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import VerificationCodeForm from '../VerificationCodeForm'; // Import the VerificationCodeForm
import { REDIRECT_URL_KEY } from '@/constants/app.constant';
import appConfig from '@/configs/app.config';
import useQuery from '@/utils/hooks/useQuery';
import useAuth from '@/utils/hooks/useAuth';
import { setUser, signInSuccess, useAppDispatch, useAppSelector } from '@/store';

interface SignInFormProps {
  disableSubmit?: boolean;
  forgotPasswordUrl?: string;
  signUpUrl?: string;
}

type SignInFormSchema = {
  userName: string;
  password: string;
  rememberMe: boolean;
}

const validationSchema = Yup.object().shape({
  userName: Yup.string().required('Please enter your user name'),
  password: Yup.string().required('Please enter your password'),
  rememberMe: Yup.bool(),
});

const SignInForm = (props: SignInFormProps) => {
  const {
    disableSubmit = false,
    forgotPasswordUrl = '/forgot-password',
    signUpUrl = '/sign-up',
  } = props;



  const navigate = useNavigate();
  const dispatch = useAppDispatch()
  const query = useQuery()
  const [message, setMessage] = useState<string | null>(null);
  const [verificationStep, setVerificationStep] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  const onSignIn = async (
    values: SignInFormSchema,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    const { userName, password } = values;
    setSubmitting(true);

    try {
      const result = await signIn({ username: userName, password });
      console.log('Sign-in result:', result);
      const redirectUrl = query.get(REDIRECT_URL_KEY)

      if (result.nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
        setMessage('Please set a new password.');
        // Handle new password entry here
      } else if (result.nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_SMS_CODE") {
        setMessage('Please enter the SMS code sent to your phone.');
        // Handle MFA code entry here
      } else if (result.nextStep.signInStep === "CONFIRM_SIGN_UP") {
        setUserName(userName);
        setVerificationStep(true);
        setMessage('Account needs to be confirmed. Please check your email for the verification code.');
      } else {
        // const result = await navsignIn(userName, 'someResValue');
        console.log("Login Successful");
        dispatch(signInSuccess(userName))
        dispatch(
            setUser({
                userName:userName
            })
        )
        navigate(
            redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath
        )
        // setMessage(result);   
    }
    } catch (error: any) {
      console.error('Error during sign-in:', error);
      setMessage(error.message || 'Error during sign-in, please try again.');
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

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("SignOut")
      navigate('/sign-in'); // Redirect to sign-in page after sign-out
    } catch (error: any) {
      console.error('Error during sign-out:', error);
      setMessage('Error during sign-out, please try again.');
    }
  };

  return (
    <div>
      {message && (
        <Alert showIcon className="mb-4" type="danger">
          {message}
        </Alert>
      )}
      {!verificationStep ? (
        <>
          <Formik
            initialValues={{
              userName: '',
              password: '',
              rememberMe: true,
            }}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting }) => {
              if (!disableSubmit) {
                onSignIn(values, setSubmitting);
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
                  <div className="flex justify-between mb-6">
                    <Field
                      className="mb-0"
                      name="rememberMe"
                      component={Checkbox}
                    >
                      Remember Me
                    </Field>
                    <ActionLink to={forgotPasswordUrl}>
                      Forgot Password?
                    </ActionLink>
                  </div>
                  <Button
                    block
                    loading={isSubmitting}
                    variant="solid"
                    type="submit"
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                  </Button>
                  <div className="mt-4 text-center">
                    <span>{`Don't have an account yet? `}</span>
                    <ActionLink to={signUpUrl}>Sign up</ActionLink>
                  </div>
                </FormContainer>
              </Form>
            )}
          </Formik>
          <Button
            onClick={handleSignOut}
            className="mt-4"
          >
            Sign Out
          </Button>
        </>
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

export default SignInForm;
