"use client";

import { useRouter } from "next/navigation";
import { AddCandidateModal } from "./add-candidate-modal";

interface AddCandidateModalWrapperProps {
  roleId: string;
}

export function AddCandidateModalWrapper({ roleId }: AddCandidateModalWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    // Refresh the page to show the new candidate
    router.refresh();
  };

  return <AddCandidateModal roleId={roleId} onSuccess={handleSuccess} />;
}
