import ActivatedYouthApplication from 'kesaseteli-shared/types/activated-youth-application';

type CompleteOperation = {
  type: 'accept' | 'reject';
  encrypted_handler_vtj_json: ActivatedYouthApplication['encrypted_handler_vtj_json'];
};

export default CompleteOperation;
