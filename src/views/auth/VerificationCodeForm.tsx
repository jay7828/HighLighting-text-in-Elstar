import { FormItem, FormContainer } from '@/components/ui/Form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { resendSignUpCode, confirmSignUp } from 'aws-amplify/auth';

interface VerificationCodeFormProps {
  userName: string | null;
  onResendCode: () => void;
  onConfirmCode: (code: string) => void;
  setMessage: (msg: string) => void;
  setSubmitting: (isSubmitting: boolean) => void;
}

const VerificationCodeForm = ({
  userName,
  onResendCode,
  onConfirmCode,
  setMessage,
  setSubmitting,
}: VerificationCodeFormProps) => (
  <Formik
    initialValues={{
      code: '',
    }}
    validationSchema={Yup.object().shape({
      code: Yup.string().required('Please enter the verification code'),
    })}
    onSubmit={(values, { setSubmitting }) => {
      onConfirmCode(values.code);
      setSubmitting(false);
    }}
  >
    {({ touched, errors, isSubmitting }) => (
      <Form>
        <FormContainer>
          <FormItem
            label="Verification Code"
            invalid={errors.code && touched.code}
            errorMessage={errors.code}
          >
            <Field
              type="text"
              autoComplete="off"
              name="code"
              placeholder="Enter the verification code"
              component={Input}
            />
          </FormItem>
          <Button
            block
            loading={isSubmitting}
            variant="solid"
            type="submit"
          >
            {isSubmitting ? 'Verifying Code...' : 'Verify Code'}
          </Button>
          <Button
            block
            className="mt-2"
            onClick={onResendCode}
          >
            Resend Code
          </Button>
        </FormContainer>
      </Form>
    )}
  </Formik>
);

export default VerificationCodeForm;
