import { Button } from '@zendeskgarden/react-buttons';
import { Modal } from '@zendeskgarden/react-modals';

type Props = {
  onClose: () => void;
  handleSubmit: () => void;
  title: string;
  description: string;
};

const ConfirmationModal = ({ onClose, title, description, handleSubmit }: Props) => {
  return (
    <Modal onClose={onClose} style={{ maxWidth: '80%' }}>
      <Modal.Header tag="h2" isDanger>
        {title}
      </Modal.Header>
      <Modal.Body>
        <div dangerouslySetInnerHTML={{ __html: description }} />
      </Modal.Body>
      <Modal.Footer>
        <Modal.FooterItem>
          <Button onClick={onClose} isBasic>
            Cancel
          </Button>
        </Modal.FooterItem>
        <Modal.FooterItem>
          <Button isPrimary isDanger onClick={handleSubmit}>
            Confirm
          </Button>
        </Modal.FooterItem>
      </Modal.Footer>
      <Modal.Close aria-label="Close modal" />
    </Modal>
  );
};

export default ConfirmationModal;
