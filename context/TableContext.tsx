import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { TablePromptModal } from "@/components/TablePromptModal";
import { useAuthContext } from "@/context/AuthContext";

interface TableContextValue {
  tableNumber: string;
  setTableNumber: (table: string) => void;
  clearTableNumber: () => void;
  hasTableNumber: boolean;
  openTablePrompt: () => void;
  closeTablePrompt: () => void;
}

const TableContext = createContext<TableContextValue | undefined>(undefined);

interface TablePromptHostProps {
  tableNumber: string;
  isPromptVisible: boolean;
  setTableNumber: (table: string) => void;
  openTablePrompt: () => void;
  closeTablePrompt: () => void;
}

const TablePromptHost: React.FC<TablePromptHostProps> = ({
  tableNumber,
  isPromptVisible,
  setTableNumber,
  openTablePrompt,
  closeTablePrompt,
}) => {
  const { user, isAdmin, profileReady } = useAuthContext();
  const hasAutoPrompted = useRef(false);

  useEffect(() => {
    if (!user) {
      hasAutoPrompted.current = false;
    }
  }, [user]);

  useEffect(() => {
    if (!profileReady || !user || isAdmin || tableNumber) {
      return;
    }

    if (hasAutoPrompted.current) {
      return;
    }

    hasAutoPrompted.current = true;
    openTablePrompt();
  }, [user, isAdmin, tableNumber, profileReady, openTablePrompt]);

  useEffect(() => {
    if (isAdmin) {
      closeTablePrompt();
    }
  }, [isAdmin, closeTablePrompt]);

  if (isAdmin) {
    return null;
  }

  return (
    <TablePromptModal
      visible={isPromptVisible}
      initialValue={tableNumber}
      onConfirm={(num) => {
        setTableNumber(num);
        closeTablePrompt();
      }}
      cancelable
      onClose={closeTablePrompt}
    />
  );
};

export const TableProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tableNumber, setTableNumberState] = useState<string>("");
  const [isPromptVisible, setIsPromptVisible] = useState(false);

  const setTableNumber = useCallback((table: string) => {
    setTableNumberState(table.trim());
  }, []);

  const clearTableNumber = useCallback(() => {
    setTableNumberState("");
  }, []);

  const openTablePrompt = useCallback(() => {
    setIsPromptVisible(true);
  }, []);

  const closeTablePrompt = useCallback(() => {
    setIsPromptVisible(false);
  }, []);

  const hasTableNumber = tableNumber.length > 0;

  const value = useMemo<TableContextValue>(
    () => ({
      tableNumber,
      setTableNumber,
      clearTableNumber,
      hasTableNumber,
      openTablePrompt,
      closeTablePrompt,
    }),
    [
      tableNumber,
      hasTableNumber,
      setTableNumber,
      clearTableNumber,
      openTablePrompt,
      closeTablePrompt,
    ],
  );

  return (
    <TableContext.Provider value={value}>
      {children}
      <TablePromptHost
        tableNumber={tableNumber}
        isPromptVisible={isPromptVisible}
        setTableNumber={setTableNumber}
        openTablePrompt={openTablePrompt}
        closeTablePrompt={closeTablePrompt}
      />
    </TableContext.Provider>
  );
};

export const useTableContext = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("useTableContext must be used within a TableProvider");
  }

  return context;
};
