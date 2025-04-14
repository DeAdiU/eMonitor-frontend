'use client'

import * as React from "react";
import { useEffect, useState } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import axios from "axios";
import { useAuth } from "@/context/AuthContext"; // Assuming you have this context setup

// This component expects an `onSelect` function prop which it calls
// with the selected person's full object (or null) when an item is chosen.
export function CategoryBox({ onSelect }) {
  const [open, setOpen] = useState(false);
  // The value state still stores the selected person's ID for internal tracking
  const [value, setValue] = useState(null);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth(); // Make sure useAuth() provides getToken

  useEffect(() => {
    const fetchPeople = async () => {
      setLoading(true);
      setError(null);
      // Ensure getToken is available before proceeding
      if (!getToken) {
          setError("Authentication context not available.");
          setLoading(false);
          return;
      }
      try {
        const token = await getToken();
        if (!token) {
            setError("Authentication token not available.");
            setLoading(false);
            return;
        }
        const response = await axios.get(
          // Ensure this URL is correct and accessible
          `http://127.0.0.1:8000/api/get-students/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Assuming response.data is the array of person objects
        const fetchedPeople = response.data || [];
        setPeople(fetchedPeople);

        // Reset value if the previously selected person is no longer in the list
        if (value !== null && !fetchedPeople.some(person => person.id === value)) {
             setValue(null);
             if (onSelect) {
                 onSelect(null); // Notify parent if selection is cleared
             }
        }

      } catch (e) {
        console.error("Failed to fetch people:", e);
        // Provide more specific error if possible (e.g., network error, auth error)
        if (axios.isAxiosError(e) && e.response?.status === 401) {
            setError("Authentication failed.");
        } else {
            setError("Failed to load people.");
        }
        setPeople([]);
        setValue(null);
         if (onSelect) {
             onSelect(null);
         }
      } finally {
        setLoading(false);
      }
    };

    fetchPeople();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken]); // Add getToken to dependency array if it might change, though often stable

  // --- MODIFIED handleSelect ---
  const handleSelect = (personId) => {
    const isDeselecting = personId === value;
    const newValue = isDeselecting ? null : personId;
    setValue(newValue); // Update internal state (selected ID)

    if (onSelect) {
      if (isDeselecting) {
        onSelect(null); // Pass null if deselected
      } else {
        // Find the full person object corresponding to the selected ID
        const selectedPersonObject = people.find(person => person.id === personId);
        onSelect(selectedPersonObject || null); // Pass the full object or null if not found (shouldn't happen ideally)
      }
    }
    setOpen(false);
  };
  // --- END MODIFICATION ---

  // Find the selected person object based on the stored ID (value) for display purposes
  const selectedPersonForDisplay = value !== null ? people.find((person) => person.id === value) : null;

  // Determine the label to display on the button
  const displayLabel = selectedPersonForDisplay
    ? `${selectedPersonForDisplay.first_name} ${selectedPersonForDisplay.last_name}`
    : "Select person...";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between border-none shadow-none"
          disabled={loading || !!error}
        >
          {loading ? "Loading..." : error ? "Error" : displayLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search person..." />
          <CommandList>
            {error && <div className="p-2 text-sm text-red-600">{error}</div>}
            {!loading && !error && people.length === 0 && (
              <CommandEmpty>No person found.</CommandEmpty>
            )}
            {!loading && !error && people.length > 0 && (
              <CommandGroup>
                {people.map((person) => {
                  const fullName = `${person.first_name} ${person.last_name}`;
                  return (
                    <CommandItem
                      key={person.id}
                      value={fullName} // Value for filtering
                      onSelect={() => handleSelect(person.id)} // Still pass ID to handler
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === person.id ? "opacity-100" : "opacity-0" // Checkmark based on internal ID state
                        )}
                      />
                      {fullName}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}