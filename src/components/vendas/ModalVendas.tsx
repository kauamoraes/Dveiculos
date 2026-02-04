interface ModalProps {
    modalOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function ModalVendas({ modalOpen, onClose, title, children }: ModalProps){
     if (!modalOpen) return null;

    return (
        <div>
            <div className="fixed inset-0 bg-black/60  flex items-center justify-center z-50">
                <div className="bg-slate-900 p-6 rounded-lg shadow-lg w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-orange-500">{title}</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            ✕
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    )
}