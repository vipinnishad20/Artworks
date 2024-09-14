
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import 'primeicons/primeicons.css'; 
import './ArtworksTable.css'; 

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

const ArtworksTable: React.FC = () => {
  const [data, setData] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [page, setPage] = useState<number>(0);
  const [rows] = useState<number>(12); 
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [rowCountToSelect, setRowCountToSelect] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page + 1}`);
        const artworks = response.data.data.map((item: any) => ({
          id: item.id,
          title: item.title || 'N/A',
          place_of_origin: item.place_of_origin || 'N/A',
          artist_display: item.artist_display || 'N/A',
          inscriptions: item.inscriptions || 'N/A',
          date_start: item.date_start || 0,
          date_end: item.date_end || 0,
        }));

        setData(artworks);
        setTotalRecords(response.data.pagination.total); 
        setTotalPages(Math.ceil(response.data.pagination.total / rows));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [page, rows]);

  const handlePageChange = (event: any) => {
    setPage(event.page);
  };

  const handleRowSelection = (rowId: number) => {
    setSelectedRows(prev => {
      const updated = new Set(prev);
      if (updated.has(rowId)) {
        updated.delete(rowId);
      } else {
        updated.add(rowId);
      }
      return updated;
    });
  };

  const handleSelectAllChange = () => {
    if (isAllSelected()) {
      // Deselect all rows on the current page
      data.forEach(row => selectedRows.delete(row.id));
      setSelectedRows(new Set(selectedRows));
    } else {
      // Select all rows on the current page
      data.forEach(row => selectedRows.add(row.id));
      setSelectedRows(new Set(selectedRows));
    }
  };

  const isRowSelected = (rowId: number) => {
    return selectedRows.has(rowId);
  };

  const isAllSelected = useCallback(() => {
    return data.every(row => selectedRows.has(row.id));
  }, [data, selectedRows]);

  const openDialog = () => {
    setRowCountToSelect(0);
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
  };

  const fetchDataForRowSelection = async (startPage: number, count: number) => {
    let rowsFetched = 0;
    const newSelectedRows = new Set<number>(selectedRows);
    
    while (rowsFetched < count && startPage < totalPages) {
      try {
        const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${startPage + 1}`);
        const artworks = response.data.data.map((item: any) => ({
          id: item.id,
          title: item.title || 'N/A',
          place_of_origin: item.place_of_origin || 'N/A',
          artist_display: item.artist_display || 'N/A',
          inscriptions: item.inscriptions || 'N/A',
          date_start: item.date_start || 0,
          date_end: item.date_end || 0,
        }));

        artworks.forEach((row: { id: number; }) => {
          if (rowsFetched < count) {
            newSelectedRows.add(row.id);
            rowsFetched++;
          }
        });

        startPage++;
      } catch (error) {
        console.error('Error fetching data for row selection:', error);
      }
    }

    setSelectedRows(newSelectedRows);
  };

  const saveRowSelection = async () => {
    
    const currentPageStart = page;
    await fetchDataForRowSelection(currentPageStart, rowCountToSelect);
    setDialogVisible(false);
  };

  const headerCheckbox = (
    <div className="header-checkbox-container">
      <Checkbox
        checked={isAllSelected()}
        onChange={handleSelectAllChange}
        className="select-all-checkbox"
        inputId="select-all"
      />
      <i className="pi pi-chevron-down select-all-icon" onClick={openDialog}></i> {/* Chevron Down Icon */}
    </div>
  );

  const header = (
    <div className="table-header">
      <h5>Artworks</h5>
    </div>
  );

  return (
    <div className="datatable-crud-demo">
      <DataTable
        value={data}
        paginator
        rows={rows}
        totalRecords={totalRecords}
        onPage={handlePageChange}
        responsiveLayout="scroll"
        header={header}
      >
        <Column
          header={headerCheckbox}
          body={(rowData: Artwork) => (
            <Checkbox
              checked={isRowSelected(rowData.id)}
              onChange={() => handleRowSelection(rowData.id)}
            />
          )}
          style={{ width: '4rem' }}
        />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist Display" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>
      <Paginator
        first={page * rows}
        rows={rows}
        totalRecords={totalRecords}
        onPageChange={handlePageChange}
      />

      <Dialog
        header="Select Number of Rows"
        visible={dialogVisible}
        onHide={closeDialog}
        modal
        footer={
          <div>
            <button className="p-button p-component p-button-secondary" onClick={closeDialog}>
              Cancel
            </button>
            <button className="p-button p-component p-button-primary" onClick={saveRowSelection}>
              Save
            </button>
          </div>
        }
      >
        <div className="p-field">
          <label htmlFor="rowsToSelect" style={{padding:"20px"}}>Select Rows:</label>
          <InputNumber
            id="rowsToSelect"
            value={rowCountToSelect}
            onValueChange={(e) => setRowCountToSelect(e.value || 0)}
            min={0}
            showButtons
            buttonLayout="horizontal"
            placeholder="Enter number"
          />
        </div>
      </Dialog>
    </div>
  );
};

export default ArtworksTable;
