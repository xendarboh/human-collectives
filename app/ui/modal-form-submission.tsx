const ModalFormSubmission = ({ open, children }: ModalFormSubmissionProps) => {
  return (
    <div className={"modal " + (open ? "modal-open" : "")}>
      <div className="modal-box grid place-items-center">
        <div>{children}</div>
      </div>
    </div>
  );
};

ModalFormSubmission.displayName = "ModalFormSubmission";

interface ModalFormSubmissionProps {
  children: any;
  open: boolean;
}

export type { ModalFormSubmissionProps };
export { ModalFormSubmission };
