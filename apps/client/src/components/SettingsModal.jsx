import * as React from "react";
import Button from "@mui/joy/Button";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import {
  ListItem,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
} from "@mui/joy";
import { CiSettings } from "react-icons/ci";

export default function SettingsModal() {
  const [open, setOpen] = React.useState(false);
  return (
    <React.Fragment>
      <ListItem
        style={{
          justifyContent: "start",
          textTransform: "none",
        }}
      >
        <ListItemButton
          variant="plain"
          color="primary"
          onClick={() => setOpen(true)}
        >
          <ListItemDecorator>
            <CiSettings />
          </ListItemDecorator>
          <ListItemContent>Settings</ListItemContent>
        </ListItemButton>
      </ListItem>

      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Sheet
          variant="outlined"
          sx={{
            maxWidth: 500,
            borderRadius: "md",
            p: 3,
            boxShadow: "lg",
          }}
        >
          <ModalClose variant="plain" sx={{ m: 1 }} />
          <Typography
            component="h2"
            id="modal-title"
            level="h4"
            textColor="inherit"
            fontWeight="lg"
            mb={1}
          >
            This is the modal title
          </Typography>
          <Typography id="modal-desc" textColor="text.tertiary">
            Make sure to use <code>aria-labelledby</code> on the modal dialog
            with an optional <code>aria-describedby</code> attribute.
          </Typography>
        </Sheet>
      </Modal>
    </React.Fragment>
  );
}
