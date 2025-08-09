// components/gallery/utils/uploadModalStyles.tsx - Modern Professional Greyscale Styles
import styled, { keyframes } from 'styled-components';

// ==================== ANIMATIONS ====================
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// ==================== MODAL STRUCTURE ====================
export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(44, 44, 44, 0.4);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: ${fadeIn} 0.3s ease;
`;

export const ModalContent = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid #e0e0e0;
  width: 100%;
  max-width: 900px;
  max-height: 95vh;
  display: flex;
  flex-direction: column;
  animation: ${slideUp} 0.3s ease;
  position: relative;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
  background: #f8f8f8;
`;

export const HeaderContent = styled.div`
  flex: 1;
`;

export const ModalTitle = styled.h2`
  font-family: 'Work Sans', sans-serif;
  font-size: 1.5rem;
  font-weight: 300;
  margin: 0 0 0.5rem 0;
  color: #2c2c2c;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const ModalSubtitle = styled.p`
  font-size: 0.875rem;
  color: #666;
  margin: 0;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const CloseButton = styled.button`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  color: #666;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-left: 1rem;
  
  &:hover {
    color: #2c2c2c;
    background: #f8f8f8;
    border-color: #2c2c2c;
  }
`;

// ==================== STEP INDICATOR ====================
export const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

export const StepNumber = styled.div<{ $active?: boolean }>`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 300;
  font-family: 'Work Sans', sans-serif;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  ${props => props.$active ? `
    background: #2c2c2c;
    color: #f8f8f8;
  ` : `
    background: #f0f0f0;
    color: #666;
    border: 1px solid #e0e0e0;
  `}
`;

export const StepLine = styled.div<{ $completed?: boolean }>`
  width: 40px;
  height: 2px;
  margin: 0 0.5rem;
  background: ${props => props.$completed ? '#2c2c2c' : '#e0e0e0'};
  transition: all 0.3s ease;
`;

// ==================== MODAL BODY ====================
export const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;
`;

export const FormContent = styled.div`
  padding: 2rem;
`;

export const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

export const LeftColumn = styled.div`
  @media (max-width: 768px) {
    order: 2;
  }
`;

export const RightColumn = styled.div`
  @media (max-width: 768px) {
    order: 1;
  }
`;

// ==================== UPLOAD SECTION ====================
export const UploadSection = styled.div`
  margin-bottom: 1.5rem;
`;

export const UploadArea = styled.div`
  border: 1px solid #e0e0e0;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff;
  
  &:hover {
    border-color: #2c2c2c;
    background: #f8f8f8;
  }
`;

export const UploadIconWrapper = styled.div`
  color: #666;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  
  ${UploadArea}:hover & {
    color: #2c2c2c;
  }
`;

export const UploadText = styled.p`
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #2c2c2c;
  font-weight: 300;
  font-family: 'Work Sans', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const UploadHint = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: #666;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

// ==================== PREVIEW COMPONENTS ====================
export const PreviewSection = styled.div`
  margin-bottom: 1rem;
`;

export const PreviewContainer = styled.div`
  position: relative;
  overflow: hidden;
  background: #f0f0f0;
  border: 1px solid #e0e0e0;
`;

export const PreviewImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
`;

export const PreviewOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(44, 44, 44, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  
  ${PreviewContainer}:hover & {
    opacity: 1;
  }
`;

export const ChangeButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #ffffff;
  color: #2c2c2c;
  border: 1px solid #e0e0e0;
  font-weight: 300;
  font-family: 'Work Sans', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.875rem;
  
  &:hover {
    background: #f8f8f8;
    border-color: #2c2c2c;
  }
`;

export const ImageInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(44, 44, 44, 0.9), transparent);
  color: #f8f8f8;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: end;
`;

export const ImageName = styled.div`
  font-size: 0.875rem;
  font-weight: 300;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ImageSize = styled.div`
  font-size: 0.75rem;
  opacity: 0.9;
  font-weight: 300;
`;

// ==================== GUIDELINES ====================
export const GuidelinesCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid #e0e0e0;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

export const GuidelineTitle = styled.h4`
  font-size: 1rem;
  font-weight: 300;
  margin: 0 0 1rem 0;
  color: #2c2c2c;
  font-family: 'Work Sans', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const GuidelineList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const GuidelineItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const GuidelineIcon = styled.span`
  font-size: 1rem;
  flex-shrink: 0;
`;

export const GuidelineText = styled.span`
  font-size: 0.875rem;
  color: #666;
  font-weight: 300;
`;

// ==================== FORM COMPONENTS ====================
export const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

export const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 300;
  color: #2c2c2c;
  margin: 0 0 0.75rem 0;
  font-family: 'Work Sans', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 300;
  color: #2c2c2c;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-family: 'Work Sans', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const RequiredStar = styled.span`
  color: #2c2c2c;
  font-weight: 400;
`;

export const Input = styled.input`
  padding: 1rem;
  border: 1px solid #e0e0e0;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: #ffffff;
  color: #2c2c2c;
  font-family: 'Work Sans', sans-serif;
  font-weight: 300;
  
  &:focus {
    outline: none;
    border-color: #2c2c2c;
    background: #f8f8f8;
  }
  
  &::placeholder {
    color: #999;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 300;
  }
`;

export const TextArea = styled.textarea`
  padding: 1rem;
  border: 1px solid #e0e0e0;
  font-size: 0.875rem;
  resize: vertical;
  transition: all 0.2s ease;
  background: #ffffff;
  color: #2c2c2c;
  font-family: 'Work Sans', sans-serif;
  font-weight: 300;
  line-height: 1.6;
  
  &:focus {
    outline: none;
    border-color: #2c2c2c;
    background: #f8f8f8;
  }
  
  &::placeholder {
    color: #999;
    font-weight: 300;
  }
`;

export const Select = styled.select`
  padding: 1rem;
  border: 1px solid #e0e0e0;
  font-size: 0.875rem;
  background: #ffffff;
  color: #2c2c2c;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Work Sans', sans-serif;
  font-weight: 300;
  
  &:focus {
    outline: none;
    border-color: #2c2c2c;
    background: #f8f8f8;
  }
`;

export const PriceInputWrapper = styled.div`
  position: relative;
`;

export const PriceSymbol = styled.span`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-weight: 300;
  z-index: 1;
  font-family: 'Work Sans', sans-serif;
`;

export const FieldHint = styled.span`
  font-size: 0.75rem;
  color: #666;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

// ==================== ERROR HANDLING ====================
export const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  color: #2c2c2c;
  font-size: 0.875rem;
  margin-top: 1rem;
`;

export const ErrorIcon = styled.span`
  font-size: 1rem;
  flex-shrink: 0;
`;

export const ErrorText = styled.span`
  font-weight: 300;
`;

// ==================== MODAL FOOTER ====================
export const ModalFooter = styled.div`
  padding: 1.5rem 2rem;
  border-top: 1px solid #e0e0e0;
  flex-shrink: 0;
  background: #f8f8f8;
`;

export const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

// ==================== BUTTONS ====================
export const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: #2c2c2c;
  color: #f8f8f8;
  border: 1px solid #2c2c2c;
  font-weight: 300;
  font-size: 0.875rem;
  font-family: 'Work Sans', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  &:hover:not(:disabled) {
    background: #1a1a1a;
    border-color: #1a1a1a;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: #ffffff;
  color: #666;
  border: 1px solid #e0e0e0;
  font-weight: 300;
  font-size: 0.875rem;
  font-family: 'Work Sans', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  &:hover:not(:disabled) {
    background: #f8f8f8;
    color: #2c2c2c;
    border-color: #2c2c2c;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export const ArrowIcon = styled.span`
  font-size: 0.875rem;
  font-weight: 300;
  transition: all 0.2s ease;
`;

// ==================== AUTHENTICATION PROMPT ====================
export const AuthPrompt = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 3rem;
  gap: 1rem;
`;

export const AuthIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 0.75rem;
`;

export const AuthTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 300;
  color: #2c2c2c;
  margin: 0;
  font-family: 'Work Sans', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const AuthDescription = styled.p`
  color: #666;
  font-size: 0.875rem;
  max-width: 300px;
  margin: 0;
  font-weight: 300;
  line-height: 1.6;
`;

export const AuthActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
  }
`;