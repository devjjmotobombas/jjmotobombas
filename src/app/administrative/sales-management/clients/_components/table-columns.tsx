"use client";

import { ColumnDef } from "@tanstack/react-table";

import { clientsTable } from "@/db/schema";
import { formatPhoneNumber } from "@/helpers/phone";

import TableClientActions from "./table-actions";

type Client = typeof clientsTable.$inferSelect;

export const clientsTableColumns: ColumnDef<Client>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Nome",
  },
  {
    id: "phoneNumber",
    accessorKey: "phoneNumber",
    header: "Contato",
    cell: ({ row }) => {
      const phone = row.getValue("phoneNumber") as string;
      return formatPhoneNumber(phone);
    },
  },
  {
    id: "actions",
    accessorKey: "actions",
    header: "Ações",
    cell: (params) => {
      const client = params.row.original;
      return <TableClientActions client={client} />;
    },
  },
];
