import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAlert } from '../../context/AlertContext';
import { mockDb, subscribeToDb } from '../../lib/supabaseClient';
import { updateFavicon, compressImage, syncPortalBranding } from '../../utils/favicon';
import { generateUsernameAndPass } from '../../utils/idGenerator';
import { ExportButtons } from '../../components/ExportButtons';
import { 
  Truck, DollarSign, Percent, BarChart3, Users, Shield, 
  Inbox, Settings, Briefcase, Plus, Edit, Trash2, CheckCircle, 
  X, Eye, PlusCircle, MinusCircle, Clock, MapPin, Video, Image as ImageIcon, Award,
  Building, Sparkles, Filter, CheckCircle2
} from 'lucide-react';

const defaultVacancies = [
  {
    id: 'vac-1',
    job_title: 'Senior Heavy Equipment Operator (Excavator / Dozer)',
    job_type: 'Full-Time Permanent',
    description: 'Operating CAT 320 excavators and D8 bulldozers on high-volume construction and road sites. Must have valid Grade-3 Ethiopian Heavy Driving License.',
    place_of_application: 'Head Office - Bole Subcity, Addis Ababa',
    expiry_date: '2026-08-30',
    written_exam_date: '2026-08-15T09:00',
    written_exam_venue: 'Main Assembly Hall, 2nd Floor',
    interview_date: '2026-08-20T10:30',
    interview_venue: 'HR Executive Boardroom'
  },
  {
    id: 'vac-2',
    job_title: 'Fleet Maintenance Engineer & Mechanical Specialist',
    job_type: 'Full-Time Contract',
    description: 'Responsible for diagnostic troubleshooting, hydraulic system repairs, and routine preventive maintenance across all rental machinery.',
    place_of_application: 'Central Fleet Workshop - Akaki Kaliti',
    expiry_date: '2026-09-15',
    written_exam_date: '2026-09-01T10:00',
    written_exam_venue: 'Engineering Training Center',
    interview_date: '2026-09-05T14:00',
    interview_venue: 'Technical Panel Office'
  }
];

const defaultApplications = [
  {
    id: 'app-1',
    full_name: 'Abebe Bikila Worku',
    email: 'abebe.worku@gmail.com',
    phone: '+251 911 234 567',
    job_title: 'Senior Heavy Equipment Operator (Excavator / Dozer)',
    status: 'Exam Scheduled',
    written_exam_status: 'Passed',
    written_exam_score: 88,
    interview_status: 'Passed',
    interview_score: 92,
    final_result: 'Passed & Selected',
    evaluator_remarks: 'Excellent practical operating experience and high safety score.'
  },
  {
    id: 'app-2',
    full_name: 'Tigist Hailemariam',
    email: 'tigist.haile@yahoo.com',
    phone: '+251 922 876 543',
    job_title: 'Fleet Maintenance Engineer & Mechanical Specialist',
    status: 'Submitted',
    written_exam_status: 'Pending',
    written_exam_score: 0,
    interview_status: 'Pending',
    interview_score: 0,
    final_result: 'Pending',
    evaluator_remarks: 'Document verification completed.'
  }
];

const defaultPartnerRequests = [
  {
    id: 'pm-req-1',
    organization_name: 'Sur Construction PLC',
    contact_name: 'Eng. Dawit Tesfaye',
    contact_email: 'dawit.t@surconstruction.com',
    contact_phone: '+251 911 456 789',
    address: 'Kirkos Subcity, Addis Ababa',
    machinery_name: 'CAT D9T Heavy Duty Crawler Bulldozer',
    machinery_type: 'Bulldozer',
    plate_number: 'ET-90211-AA',
    quantity: 2,
    proposed_rate: 165.00,
    agreement_duration: '6 Months (Aug 2026 - Feb 2027)',
    description: '350HP crawler bulldozer in excellent condition with ripper attachment. Full maintenance history available.',
    image_url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&auto=format&fit=crop&q=80',
    status: 'Pending',
    is_seen: false,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'pm-req-2',
    organization_name: 'Sunshine Construction Ltd',
    contact_name: 'Bethlehem Assefa',
    contact_email: 'info@sunshineconstruction.et',
    contact_phone: '+251 929 112 334',
    address: 'Bole Medhanealem, Addis Ababa',
    machinery_name: 'SANY 75-Ton Mobile Telescopic Crane',
    machinery_type: 'Crane',
    plate_number: 'ET-88304-AA',
    quantity: 1,
    proposed_rate: 240.00,
    agreement_duration: '1 Year Contract',
    description: '75-ton lattice boom crane ready for heavy bridge erection and structural lifting. Certified operator provided.',
    image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
    status: 'Approved',
    is_seen: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

const defaultReports = [
  {
    id: 'rep-1',
    sender_id: 'usr-sw-1',
    sender_role: 'Site Worker',
    title: 'Hydraulic Pressure Check & Maintenance Alert',
    content: 'Logged 12 hrs on Modjo Express Highway site. Minor hydraulic fluid leak noticed on arm cylinder of CAT 320 Excavator. Requires preventive maintenance seal kit replacement.',
    status: 'Pending',
    is_seen: false,
    registrar_comments: '',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'rep-2',
    sender_id: 'usr-sm-1',
    sender_role: 'Store Manager',
    title: 'Spare Parts Inventory Audit & Defective Rollers',
    content: 'Stock count finished for Akaki Central Depot. 4 excavator track shoes damaged during transport. Request replacement order approval.',
    status: 'Reviewed',
    is_seen: true,
    registrar_comments: 'Replacement parts order authorized with supplier.',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'rep-3',
    sender_id: 'usr-acc-1',
    sender_role: 'Accountant',
    title: 'Monthly Revenue & Fuel Expense Audit Report',
    content: 'Total machinery rental revenue collected: $45,200. Total diesel fuel and site transport expenses: $12,800. Net margin calculated.',
    status: 'Approved',
    is_seen: true,
    registrar_comments: 'Reconciled with bank deposit records.',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'rep-4',
    sender_id: 'usr-fin-1',
    sender_role: 'Finance',
    title: 'Quarterly Machinery Fleet Acquisition Budget Proposal',
    content: 'Proposed budget allocation of $350,000 for acquiring 2 new 30-ton mobile cranes and emergency breakdown fund.',
    status: 'Pending',
    is_seen: false,
    registrar_comments: '',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'rep-5',
    sender_id: 'usr-mgr-1',
    sender_role: 'Manager',
    title: 'Consolidated Site Operations & Shift Roster Report',
    content: 'All 18 site operators dispatched to highway and dam construction sites. Zero downtime recorded for past 7 days.',
    status: 'Pending',
    is_seen: false,
    registrar_comments: '',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'rep-6',
    sender_id: 'usr-ext-1',
    sender_role: 'External Partner',
    title: 'Partner Organization Rental Agreement Review Request',
    content: 'Submitted agreement proposal to rent 3 Komatsu bulldozers to Machinery Rent organization for 6-month highway contract.',
    status: 'Pending',
    is_seen: false,
    registrar_comments: '',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString()
  }
];

export const MainRegistrarDashboard = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();

  const [activeSubTab, setActiveSubTab] = useState('machinery');

  // Core Data States
  const [machineryList, setMachineryList] = useState([]);
  const [rentalsList, setRentalsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [partnerRequestsList, setPartnerRequestsList] = useState([]);
  const [selectedPartnerRequest, setSelectedPartnerRequest] = useState(null);
  const [partnerDetailModalOpen, setPartnerDetailModalOpen] = useState(false);
  const [vacanciesList, setVacanciesList] = useState([]);
  const [settings, setSettings] = useState({});
  const [momentsList, setMomentsList] = useState([]);
  const [momentModalOpen, setMomentModalOpen] = useState(false);
  const [editingMoment, setEditingMoment] = useState(null);
  const [momentForm, setMomentForm] = useState({ title: '', media_type: 'image', media_url: '', description: '' });

  // Reports Filtering State (Category & Seen Status)
  const [reportCategoryFilter, setReportCategoryFilter] = useState('ALL');
  const [reportSeenFilter, setReportSeenFilter] = useState('ALL'); // ALL, UNSEEN, SEEN

  // Modals state
  const [machineryModalOpen, setMachineryModalOpen] = useState(false);
  const [editingMachinery, setEditingMachinery] = useState(null);
  const [machineryImage, setMachineryImage] = useState('');

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    full_name: '',
    role: 'Accountant',
    contact: '',
    email: '',
    gender: 'Male',
    address: ''
  });

  const [editingVacancy, setEditingVacancy] = useState(null);
  const [vacancyModalOpen, setVacancyModalOpen] = useState(false);
  const [vacancyForm, setVacancyForm] = useState({
    job_title: '',
    job_type: 'Permanent',
    description: '',
    place_of_application: 'Head Office - Addis Ababa',
    expiry_date: new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
    written_exam_date: '',
    written_exam_venue: 'Main Assembly Hall',
    interview_date: '',
    interview_venue: 'HR Boardroom'
  });

  // Report comments modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [registrarComment, setRegistrarComment] = useState('');

  // Dedicated Edit Modals State
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedMachineryForPrice, setSelectedMachineryForPrice] = useState(null);
  const [newHourlyPrice, setNewHourlyPrice] = useState(100);

  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [selectedMachineryForDiscount, setSelectedMachineryForDiscount] = useState(null);
  const [newDiscountPercent, setNewDiscountPercent] = useState(0);

  const [passwordResetModalOpen, setPasswordResetModalOpen] = useState(false);
  const [selectedUserForPasswordReset, setSelectedUserForPasswordReset] = useState(null);
  const [resetPasswordInput, setResetPasswordInput] = useState('');

  // Applicant Exam & Interview Evaluation Modal State
  const [applicationsList, setApplicationsList] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [resultForm, setResultForm] = useState({
    written_exam_status: 'Pending',
    written_exam_score: 0,
    interview_status: 'Pending',
    interview_score: 0,
    final_result: 'Pending',
    evaluator_remarks: ''
  });

  const refreshAllData = () => {
    setMachineryList(mockDb.getTable('machinery', []));
    setRentalsList(mockDb.getTable('rentals', []));
    setUsersList(mockDb.getTable('profiles', []));
    setReportsList(mockDb.getTable('reports', defaultReports));
    setPartnerRequestsList(mockDb.getTable('partner_machinery_requests', defaultPartnerRequests));
    setVacanciesList(mockDb.getTable('vacancies', defaultVacancies));
    setMomentsList(mockDb.getTable('gallery_moments', []));
    setApplicationsList(mockDb.getTable('vacancy_applications', defaultApplications));

    const s = mockDb.getTable('portal_settings', []);
    if (s.length > 0) setSettings(s[0]);
  };

  useEffect(() => {
    refreshAllData();
    const unsubscribe = subscribeToDb(refreshAllData);
    return () => unsubscribe();
  }, []);

  // Partner Organization Machinery Request Approval Handlers
  const handleApprovePartnerRequest = (req) => {
    mockDb.updateRow('partner_machinery_requests', req.id, { status: 'Approved', is_seen: true });

    // Automatically insert the approved partner machinery into active machinery inventory table
    mockDb.insertRow('machinery', {
      name: req.machinery_name,
      type: req.machinery_type,
      plate_number: req.plate_number,
      quantity: Number(req.quantity),
      available_count: Number(req.quantity),
      rented_count: 0,
      price_per_hour: Number(req.proposed_rate),
      discount_percent: 0,
      description: `${req.description} (Partner Agreement: ${req.organization_name})`,
      image_url: req.image_url || '',
      operating_sites: `Partner: ${req.organization_name}`,
      status: 'Available'
    });

    refreshAllData();
    showAlert(`Partner agreement request for "${req.machinery_name}" APPROVED! Machinery added to active inventory catalog.`, 'success', 9000);
  };

  const handleDeclinePartnerRequest = (req) => {
    mockDb.updateRow('partner_machinery_requests', req.id, { status: 'Declined', is_seen: true });
    refreshAllData();
    showAlert(`Partner agreement request from ${req.organization_name} declined.`, 'info');
  };

  // Reports Seen / Unseen Status Handlers
  const handleToggleReportSeen = (report) => {
    const updatedSeenState = !report.is_seen;
    mockDb.updateRow('reports', report.id, { is_seen: updatedSeenState });
    refreshAllData();
    showAlert(`Report "${report.title}" marked as ${updatedSeenState ? 'SEEN (OLD)' : 'UNSEEN (NEW)'}.`, 'info');
  };

  const handleMarkAllReportsSeen = () => {
    const all = mockDb.getTable('reports', defaultReports);
    const updated = all.map(r => ({ ...r, is_seen: true }));
    mockDb.setTable('reports', updated);
    refreshAllData();
    showAlert('All reports in inbox marked as SEEN (READ).', 'success');
  };

  // Gallery Moment Management Handlers
  const handleMomentFilePick = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        compressImage(file, 800, 0.85).then(base64 => {
          setMomentForm(prev => ({ ...prev, media_url: base64, media_type: 'image' }));
        }).catch(() => {
          const reader = new FileReader();
          reader.onloadend = () => setMomentForm(prev => ({ ...prev, media_url: reader.result, media_type: 'image' }));
          reader.readAsDataURL(file);
        });
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMomentForm(prev => ({ ...prev, media_url: reader.result, media_type: file.type.startsWith('video/') ? 'video' : 'image' }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSaveMoment = (e) => {
    e.preventDefault();
    if (!momentForm.title || !momentForm.media_url) {
      showAlert('Please provide a title and upload media file (or URL) for the moment.', 'danger');
      return;
    }

    const payload = {
      title: momentForm.title,
      media_type: momentForm.media_type,
      media_url: momentForm.media_url,
      description: momentForm.description || '',
      created_at: new Date().toISOString()
    };

    if (editingMoment) {
      mockDb.updateRow('gallery_moments', editingMoment.id, payload);
      showAlert('Gallery moment updated successfully.', 'success');
    } else {
      mockDb.insertRow('gallery_moments', payload);
      showAlert('New gallery moment posted to live home portal!', 'success', 7000);
    }

    setMomentModalOpen(false);
    setEditingMoment(null);
    setMomentForm({ title: '', media_type: 'image', media_url: '', description: '' });
    refreshAllData();
  };

  const handleDeleteMoment = (id) => {
    mockDb.deleteRow('gallery_moments', id);
    refreshAllData();
    showAlert('Gallery moment removed from live portal.', 'warning');
  };

  // Machinery Handlers (+ / - Quantity, Save, Delete)
  const handleAdjustQuantity = (id, delta) => {
    const item = machineryList.find(m => m.id === id);
    if (!item) return;

    let existingPlates = item.plate_number ? item.plate_number.split(',').map(p => p.trim()).filter(Boolean) : [];

    if (delta === 1) {
      const newUnitIndex = existingPlates.length + 1;
      const newPlate = `ET-${Math.floor(10000 + Math.random()*90000)}-AA`;
      existingPlates.push(newPlate);
      showAlert(`Incremented stock for ${item.name}. Added unique unit plate: ${newPlate}`, 'success');
    } else if (delta === -1) {
      if (item.quantity <= 1) {
        showAlert(`Cannot decrease stock below 1. Delete machinery record if no longer in inventory.`, 'warning');
        return;
      }
      const removedPlate = existingPlates.pop();
      showAlert(`Decremented stock for ${item.name}. Removed unit plate: ${removedPlate || 'Unit'}`, 'info');
    }

    const newQty = Math.max(1, existingPlates.length);
    const newAvailable = Math.max(0, item.available_count + delta);

    mockDb.updateRow('machinery', id, {
      quantity: newQty,
      available_count: newAvailable,
      plate_number: existingPlates.join(', ')
    });
    refreshAllData();
  };

  const handleDeleteMachinery = (id) => {
    mockDb.deleteRow('machinery', id);
    refreshAllData();
    showAlert('Machinery item deleted successfully.', 'warning');
  };

  const handleMachineryImagePick = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMachineryImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveMachinery = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      name: formData.get('name'),
      type: formData.get('type'),
      plate_number: formData.get('plate_number'),
      quantity: Number(formData.get('quantity')),
      available_count: Number(formData.get('quantity')),
      rented_count: 0,
      price_per_hour: Number(formData.get('price_per_hour')),
      discount_percent: Number(formData.get('discount_percent')),
      description: formData.get('description'),
      image_url: machineryImage || formData.get('image_url') || '',
      status: 'Available'
    };

    if (editingMachinery) {
      mockDb.updateRow('machinery', editingMachinery.id, payload);
      showAlert('Machinery updated successfully.', 'success');
    } else {
      mockDb.insertRow('machinery', payload);
      showAlert('New machinery created and posted.', 'success');
    }
    setMachineryModalOpen(false);
    setMachineryImage('');
    refreshAllData();
  };

  // User & Admin Rights Creation Handler
  const handleCreateUser = (e) => {
    e.preventDefault();
    const existingProfiles = mockDb.getTable('profiles', []);
    const { username, defaultPassword } = generateUsernameAndPass(newUserForm.role, existingProfiles);

    mockDb.insertRow('profiles', {
      username,
      full_name: newUserForm.full_name,
      role: newUserForm.role,
      contact: newUserForm.contact,
      email: newUserForm.email,
      gender: newUserForm.gender,
      address: newUserForm.address,
      default_password: defaultPassword,
      password_hash: defaultPassword,
      is_password_changed: false,
      active_status: true,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
    });

    showAlert(`User ${newUserForm.full_name} created! ID/Username: ${username} | Default Pass: ${defaultPassword}`, 'success', 8000);
    setUserModalOpen(false);
    refreshAllData();
  };

  const handleToggleUserStatus = (user) => {
    mockDb.updateRow('profiles', user.id, { active_status: !user.active_status });
    refreshAllData();
    showAlert(`Account status changed for ${user.username}`, 'info');
  };

  // Release Machinery from Rent (Increments Available Count)
  const handleReleaseRental = (rental) => {
    mockDb.updateRow('rentals', rental.id, { status: 'Completed' });

    const m = machineryList.find(item => item.id === rental.machinery_id);
    if (m) {
      const newAvail = m.available_count + 1;
      const newRented = Math.max(0, m.rented_count - 1);
      mockDb.updateRow('machinery', m.id, {
        available_count: newAvail,
        rented_count: newRented,
        status: newAvail > 0 ? 'Available' : 'Rented'
      });
    }
    refreshAllData();
    showAlert('Machinery released from rent and restored to available stock.', 'success');
  };

  // Check / Uncheck Machinery Rented status logic
  const handleToggleRentedCheckbox = (item) => {
    const isCurrentlyRented = item.rented_count > 0;
    if (isCurrentlyRented) {
      // Uncheck -> Set machinery to unrented / returned
      const newRented = Math.max(0, item.rented_count - 1);
      const newAvail = Math.min(item.quantity, item.available_count + 1);
      mockDb.updateRow('machinery', item.id, {
        rented_count: newRented,
        available_count: newAvail,
        status: newAvail > 0 ? 'Available' : 'Rented'
      });
      showAlert(`Unchecked rental for ${item.name}. Stock updated automatically (${newAvail} available).`, 'success');
    } else {
      // Check -> Set machinery to rented
      if (item.available_count <= 0) {
        showAlert(`Cannot rent ${item.name}. No available units in stock!`, 'warning');
        return;
      }
      const newRented = item.rented_count + 1;
      const newAvail = Math.max(0, item.available_count - 1);
      mockDb.updateRow('machinery', item.id, {
        rented_count: newRented,
        available_count: newAvail,
        status: newAvail === 0 ? 'Rented' : 'Available'
      });
      showAlert(`Checked as rented for ${item.name}. Stock updated automatically (${newAvail} available).`, 'info');
    }
    refreshAllData();
  };

  // Create or Update Vacancy Handler
  const handleSaveVacancy = (e) => {
    e.preventDefault();
    if (editingVacancy) {
      mockDb.updateRow('vacancies', editingVacancy.id, vacancyForm);
      showAlert(`Vacancy "${vacancyForm.job_title}" updated successfully!`, 'success');
    } else {
      mockDb.insertRow('vacancies', vacancyForm);
      showAlert('New job vacancy and exam schedules published!', 'success');
    }
    setVacancyModalOpen(false);
    setEditingVacancy(null);
    refreshAllData();
  };

  // Grade & Publish Applicant Exam & Interview Results
  const handleOpenPublishResultModal = (app) => {
    setSelectedApplicant(app);
    setResultForm({
      written_exam_status: app.written_exam_status || 'Pending',
      written_exam_score: app.written_exam_score || 0,
      interview_status: app.interview_status || 'Pending',
      interview_score: app.interview_score || 0,
      final_result: app.final_result || 'Pending',
      evaluator_remarks: app.evaluator_remarks || ''
    });
    setResultModalOpen(true);
  };

  const handleSaveApplicantResults = (e) => {
    e.preventDefault();
    if (selectedApplicant) {
      mockDb.updateRow('vacancy_applications', selectedApplicant.id, resultForm);
      refreshAllData();
      showAlert(`Published exam & interview results for ${selectedApplicant.full_name}!`, 'success', 6000);
      setResultModalOpen(false);
    }
  };

  // Approve Public Rental Request
  const handleApproveRentalRequest = (rental) => {
    const m = machineryList.find(item => item.id === rental.machinery_id);
    if (!m) {
      showAlert('Machinery item for this request not found.', 'danger');
      return;
    }

    if (m.available_count <= 0) {
      showAlert(`Cannot approve rental request for ${m.name}. Stock is 0!`, 'warning');
      return;
    }

    // Update rental status to Active
    mockDb.updateRow('rentals', rental.id, { status: 'Active' });

    // Decrement available count, increment rented count, update operating site
    const newAvail = Math.max(0, m.available_count - 1);
    const newRented = m.rented_count + 1;
    const newSites = m.operating_sites 
      ? `${m.operating_sites}, ${rental.site_location}` 
      : rental.site_location;

    mockDb.updateRow('machinery', m.id, {
      available_count: newAvail,
      rented_count: newRented,
      working_hours_rented: (m.working_hours_rented || 0) + Number(rental.total_agreed_hours),
      operating_sites: newSites,
      status: newAvail === 0 ? 'Rented' : 'Available'
    });

    refreshAllData();
    showAlert(`Rental request for ${rental.organization_name} approved and accepted! Machinery stock updated automatically.`, 'success', 8000);
  };

  const handleDeclineRentalRequest = (rental) => {
    mockDb.updateRow('rentals', rental.id, { status: 'Declined' });
    refreshAllData();
    showAlert(`Rental request for ${rental.organization_name} declined.`, 'info');
  };

  const handleLogoPick = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 400);
        setSettings({ ...settings, logo_url: compressed });
        updateFavicon(compressed);
      } catch (err) {
        console.warn('Image compression failed, fallback:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setSettings({ ...settings, logo_url: reader.result });
          updateFavicon(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleHeroBgPick = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 1200);
        setSettings({ ...settings, hero_bg_url: compressed });
      } catch (err) {
        console.warn('Hero background compression failed, fallback:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setSettings({ ...settings, hero_bg_url: reader.result });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Save Portal Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    const current = mockDb.getTable('portal_settings', []);
    const settingsPayload = {
      ...settings,
      id: current.length > 0 && current[0]?.id ? current[0].id : 1,
      updated_at: new Date().toISOString()
    };
    if (current.length > 0) {
      mockDb.updateRow('portal_settings', settingsPayload.id, settingsPayload);
    } else {
      mockDb.insertRow('portal_settings', settingsPayload);
    }
    if (settingsPayload.logo_url) {
      updateFavicon(settingsPayload.logo_url);
    }
    syncPortalBranding();
    showAlert('Portal settings, images, logo, and map saved successfully!', 'success');
    refreshAllData();
  };

  const handleSavePriceModal = (e) => {
    e.preventDefault();
    if (selectedMachineryForPrice) {
      mockDb.updateRow('machinery', selectedMachineryForPrice.id, { price_per_hour: Number(newHourlyPrice) });
      refreshAllData();
      showAlert(`Updated hourly rate for ${selectedMachineryForPrice.name} to $${newHourlyPrice}/hr`, 'success');
      setPriceModalOpen(false);
    }
  };

  const handleSaveDiscountModal = (e) => {
    e.preventDefault();
    if (selectedMachineryForDiscount) {
      mockDb.updateRow('machinery', selectedMachineryForDiscount.id, { discount_percent: Number(newDiscountPercent) });
      refreshAllData();
      showAlert(`Updated discount for ${selectedMachineryForDiscount.name} to ${newDiscountPercent}%`, 'success');
      setDiscountModalOpen(false);
    }
  };

  const handleSavePasswordResetModal = (e) => {
    e.preventDefault();
    if (selectedUserForPasswordReset) {
      mockDb.updateRow('profiles', selectedUserForPasswordReset.id, {
        default_password: resetPasswordInput,
        password_hash: resetPasswordInput
      });
      refreshAllData();
      showAlert(`Password reset successfully for ${selectedUserForPasswordReset.username}`, 'success');
      setPasswordResetModalOpen(false);
    }
  };

  // Total Revenue Calculation (Considers ONLY Approved / Active or Completed rentals)
  const approvedRentals = rentalsList.filter(r => r.status === 'Active' || r.status === 'Completed');
  const totalRevenue = approvedRentals.reduce((acc, r) => acc + (Number(r.calculated_revenue) || 0), 0);

  // Counters & Filtered Reports Data Logic
  const unseenReportCount = reportsList.filter(r => !r.is_seen).length;
  const pendingPartnerCount = partnerRequestsList.filter(r => r.status === 'Pending').length;

  const filteredReports = reportsList.filter(r => {
    const matchesCategory = reportCategoryFilter === 'ALL' || r.sender_role === reportCategoryFilter;
    const matchesSeen = 
      reportSeenFilter === 'ALL' ? true :
      reportSeenFilter === 'UNSEEN' ? !r.is_seen :
      r.is_seen;
    return matchesCategory && matchesSeen;
  });

  const subTabs = [
    { id: 'machinery', label: '1. Machinery List', icon: <Truck size={16} /> },
    { id: 'prices', label: '2. Prices List', icon: <DollarSign size={16} /> },
    { id: 'discounts', label: '3. Discounts List', icon: <Percent size={16} /> },
    { id: 'revenue', label: '4. Revenue', icon: <BarChart3 size={16} /> },
    { id: 'rented', label: '5. Rented Machinery', icon: <Truck size={16} /> },
    { id: 'available', label: '6. Available Stock', icon: <CheckCircle size={16} /> },
    { id: 'workingHours', label: '7. Working Hours', icon: <Clock size={16} /> },
    { id: 'users', label: '8. Users List', icon: <Users size={16} /> },
    { id: 'admins', label: '9. Admins & Rights', icon: <Shield size={16} /> },
    { id: 'reports', label: `10. Reports Inbox ${unseenReportCount > 0 ? `(${unseenReportCount} NEW)` : ''}`, icon: <Inbox size={16} /> },
    { id: 'vacanciesAdmin', label: '11. Vacancies Admin', icon: <Briefcase size={16} /> },
    { id: 'settings', label: '12. Portal Settings', icon: <Settings size={16} /> },
    { id: 'partnerRequests', label: `13. Partner Agreements ${pendingPartnerCount > 0 ? `(${pendingPartnerCount})` : ''}`, icon: <Building size={16} /> },
    { id: 'momentsAdmin', label: '14. Moments & Gallery', icon: <ImageIcon size={16} /> }
  ];

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-700)' }}>
          Main Registrar Admin Control Center
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage overall machinery stock, rentals, users, rights, financial reports, vacancies, and portal appearance.
        </p>
      </div>

      {/* Sub-Dashboard Tabs Navigation Bar */}
      <div 
        className="scrollable-tabs"
        style={{
          display: 'flex',
          gap: '0.4rem',
          marginBottom: '1.75rem',
          background: 'var(--bg-surface)',
          padding: '0.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}
      >
        {subTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: activeSubTab === tab.id ? 700 : 500,
              backgroundColor: activeSubTab === tab.id ? 'var(--primary-600)' : 'transparent',
              color: activeSubTab === tab.id ? '#ffffff' : 'var(--text-primary)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'var(--transition-fast)'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* 1. MACHINERY LIST SUB-DASHBOARD */}
      {activeSubTab === 'machinery' && (
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Machinery Inventory Management</h3>
            <button onClick={() => { setEditingMachinery(null); setMachineryImage(''); setMachineryModalOpen(true); }} className="btn-primary">
              <Plus size={18} /> Add New Machinery
            </button>
          </div>

          <ExportButtons 
            title="Machinery Inventory Report"
            headers={['name', 'type', 'plate_number', 'quantity', 'available_count', 'price_per_hour', 'discount_percent', 'operating_sites']}
            rows={machineryList}
            filename="machinery_inventory"
          />

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name & Type</th>
                  <th>Plate Number</th>
                  <th>Quantity (+/-)</th>
                  <th>Rented (Check/Uncheck)</th>
                  <th>Available Stock</th>
                  <th>Price ($/hr)</th>
                  <th>Discount (%)</th>
                  <th>Operating Site</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {machineryList.map(m => (
                  <tr key={m.id}>
                    <td>
                      <img src={m.image_url} alt={m.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                    </td>
                    <td>
                      <strong>{m.name}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.type}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxWidth: '200px' }}>
                        {m.plate_number ? m.plate_number.split(',').map((p, idx) => (
                          <span key={idx} style={{ fontSize: '0.78rem', background: 'var(--primary-50)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--primary-700)', fontWeight: 600 }}>
                            Unit #{idx+1}: {p.trim()}
                          </span>
                        )) : <code>ET-N/A</code>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button type="button" onClick={() => handleAdjustQuantity(m.id, -1)} className="btn-secondary btn-sm" style={{ padding: '2px 6px' }}><MinusCircle size={16} /></button>
                        <span style={{ fontWeight: 800 }}>{m.quantity}</span>
                        <button type="button" onClick={() => handleAdjustQuantity(m.id, 1)} className="btn-secondary btn-sm" style={{ padding: '2px 6px' }}><PlusCircle size={16} /></button>
                      </div>
                    </td>
                    <td>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                        <input 
                          type="checkbox" 
                          checked={m.rented_count > 0} 
                          onChange={() => handleToggleRentedCheckbox(m)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span className={`badge ${m.rented_count > 0 ? 'badge-warning' : 'badge-info'}`}>
                          {m.rented_count > 0 ? `${m.rented_count} Rented` : 'Unrented'}
                        </span>
                      </label>
                    </td>
                    <td>
                      <span className={`badge ${m.available_count > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {m.available_count} Left
                      </span>
                    </td>
                    <td>${m.price_per_hour}</td>
                    <td>{m.discount_percent}%</td>
                    <td>{m.operating_sites || 'Warehouse'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={() => { setEditingMachinery(m); setMachineryImage(m.image_url || ''); setMachineryModalOpen(true); }} className="btn-secondary btn-sm"><Edit size={14} /></button>
                        <button onClick={() => handleDeleteMachinery(m.id)} className="btn-danger btn-sm"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. PRICES LIST SUB-DASHBOARD */}
      {activeSubTab === 'prices' && (
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>Machinery Hourly Rental Prices</h3>
          <ExportButtons title="Machinery Rental Prices" headers={['name', 'plate_number', 'price_per_hour']} rows={machineryList} filename="prices_list" />
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Machinery</th>
                  <th>Plate Number</th>
                  <th>Hourly Rate ($)</th>
                  <th>Update Rate</th>
                </tr>
              </thead>
              <tbody>
                {machineryList.map(m => (
                  <tr key={m.id}>
                    <td><strong>{m.name}</strong></td>
                    <td>{m.plate_number}</td>
                    <td><strong style={{ color: 'var(--primary-600)', fontSize: '1.1rem' }}>${m.price_per_hour} / hr</strong></td>
                    <td>
                      <button 
                        onClick={() => {
                          setSelectedMachineryForPrice(m);
                          setNewHourlyPrice(m.price_per_hour);
                          setPriceModalOpen(true);
                        }} 
                        className="btn-secondary btn-sm"
                      >
                        Edit Price
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. DISCOUNTS LIST SUB-DASHBOARD */}
      {activeSubTab === 'discounts' && (
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>Machinery Discount Promotions</h3>
          <ExportButtons title="Machinery Rental Discounts" headers={['name', 'plate_number', 'discount_percent']} rows={machineryList} filename="discounts_list" />
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Machinery</th>
                  <th>Plate Number</th>
                  <th>Current Discount (%)</th>
                  <th>Update Discount</th>
                </tr>
              </thead>
              <tbody>
                {machineryList.map(m => (
                  <tr key={m.id}>
                    <td><strong>{m.name}</strong></td>
                    <td>{m.plate_number}</td>
                    <td><span className="badge badge-success">{m.discount_percent}% OFF</span></td>
                    <td>
                      <button 
                        onClick={() => {
                          setSelectedMachineryForDiscount(m);
                          setNewDiscountPercent(m.discount_percent);
                          setDiscountModalOpen(true);
                        }} 
                        className="btn-secondary btn-sm"
                      >
                        Update Discount
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. REVENUE SUB-DASHBOARD */}
      {activeSubTab === 'revenue' && (
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Approved Revenue & Income Calculations</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Formula: Revenue = Agreed Working Hours × Hourly Rate - Discount | <em>* Only approved rentals (Active / Completed) are considered.</em>
              </p>
            </div>
            <div style={{ background: 'var(--primary-100)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary-800)', fontWeight: 700 }}>APPROVED PORTAL REVENUE</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary-700)' }}>${totalRevenue.toFixed(2)}</div>
            </div>
          </div>

          <ExportButtons title="Revenue Income Report" headers={['organization_name', 'site_location', 'total_agreed_hours', 'hourly_rate', 'discount_applied', 'calculated_revenue']} rows={approvedRentals} filename="revenue_report" />

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Operating Site</th>
                  <th>Agreed Hours</th>
                  <th>Hourly Rate</th>
                  <th>Discount</th>
                  <th>Approved Revenue</th>
                </tr>
              </thead>
              <tbody>
                {approvedRentals.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                      No approved rentals yet. Approve pending rental requests in Tab 5 to calculate revenue.
                    </td>
                  </tr>
                ) : (
                  approvedRentals.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.organization_name}</strong></td>
                      <td>{r.site_location}</td>
                      <td>{r.total_agreed_hours} hrs</td>
                      <td>${r.hourly_rate}/hr</td>
                      <td>{r.discount_applied}%</td>
                      <td><strong style={{ color: '#16a34a', fontSize: '1.05rem' }}>${Number(r.calculated_revenue).toFixed(2)}</strong></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. RENTED MACHINERY & APPROVAL REQUESTS SUB-DASHBOARD */}
      {activeSubTab === 'rented' && (
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>Rented Machinery & Public Rental Requests</h3>
          <ExportButtons title="Rented Machinery Log" headers={['organization_name', 'requester_email', 'requester_phone', 'site_location', 'start_date', 'end_date', 'total_agreed_hours', 'status']} rows={rentalsList} filename="rented_machinery" />

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Organization & Contact</th>
                  <th>Operating Site</th>
                  <th>Rental Dates</th>
                  <th>Agreed Hours</th>
                  <th>Status</th>
                  <th>Registrar Actions</th>
                </tr>
              </thead>
              <tbody>
                {rentalsList.map(r => {
                  const statusBadgeClass = 
                    r.status === 'Pending Approval' ? 'badge-warning' :
                    r.status === 'Active' ? 'badge-info' :
                    r.status === 'Completed' ? 'badge-success' : 'badge-danger';

                  return (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.organization_name}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.requester_email || ''} {r.requester_phone ? `(${r.requester_phone})` : ''}</div>
                      </td>
                      <td>{r.site_location}</td>
                      <td>{r.start_date} to {r.end_date}</td>
                      <td>{r.total_agreed_hours} hrs</td>
                      <td><span className={`badge ${statusBadgeClass}`}>{r.status}</span></td>
                      <td>
                        {r.status === 'Pending Approval' && (
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => handleApproveRentalRequest(r)} className="btn-primary btn-sm" style={{ backgroundColor: '#16a34a' }}>
                              <CheckCircle size={14} /> Approve & Accept
                            </button>
                            <button onClick={() => handleDeclineRentalRequest(r)} className="btn-danger btn-sm">
                              Decline
                            </button>
                          </div>
                        )}
                        {r.status === 'Active' && (
                          <button onClick={() => handleReleaseRental(r)} className="btn-secondary btn-sm">
                            Set Free From Rent
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. AVAILABLE STOCK SUB-DASHBOARD */}
      {activeSubTab === 'available' && (
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>Available Machineries For Rent</h3>
          <ExportButtons title="Available Stock" headers={['name', 'type', 'plate_number', 'available_count', 'price_per_hour']} rows={machineryList.filter(m => m.available_count > 0)} filename="available_machinery" />

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Machinery</th>
                  <th>Type</th>
                  <th>Plate Number</th>
                  <th>Available Quantity</th>
                  <th>Hourly Rate</th>
                </tr>
              </thead>
              <tbody>
                {machineryList.filter(m => m.available_count > 0).map(m => (
                  <tr key={m.id}>
                    <td><strong>{m.name}</strong></td>
                    <td>{m.type}</td>
                    <td><code>{m.plate_number}</code></td>
                    <td><span className="badge badge-success">{m.available_count} Available</span></td>
                    <td>${m.price_per_hour}/hr</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. WORKING HOUR LENGTH SUB-DASHBOARD */}
      {activeSubTab === 'workingHours' && (
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>Working Hour Log by Site</h3>
          <ExportButtons title="Working Hours Report" headers={['name', 'plate_number', 'working_hours_rented', 'operating_sites']} rows={machineryList} filename="working_hours" />

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Machinery</th>
                  <th>Plate Number</th>
                  <th>Total Hours Rented</th>
                  <th>Assigned Site Locations</th>
                </tr>
              </thead>
              <tbody>
                {machineryList.map(m => (
                  <tr key={m.id}>
                    <td><strong>{m.name}</strong></td>
                    <td><code>{m.plate_number}</code></td>
                    <td><strong>{m.working_hours_rented || 0} hours</strong></td>
                    <td>{m.operating_sites || 'Warehouse'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. USERS LIST SUB-DASHBOARD */}
      {activeSubTab === 'users' && (
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>All Registered System Users</h3>
          <ExportButtons title="Users Directory" headers={['username', 'full_name', 'role', 'email', 'contact', 'default_password', 'active_status']} rows={usersList} filename="users_list" />

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Username (Role/ID/Year)</th>
                  <th>Full Name</th>
                  <th>Role</th>
                  <th>Email & Contact</th>
                  <th>Default Password</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u.id}>
                    <td><code>{u.username}</code></td>
                    <td><strong>{u.full_name}</strong></td>
                    <td><span className="badge badge-info">{u.role}</span></td>
                    <td>
                      <div>{u.email}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.contact}</div>
                    </td>
                    <td><code>{u.default_password}</code></td>
                    <td>
                      <span className={`badge ${u.active_status ? 'badge-success' : 'badge-danger'}`}>
                        {u.active_status ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleToggleUserStatus(u)} className="btn-secondary btn-sm">
                        {u.active_status ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. ADMINS & RIGHTS SUB-DASHBOARD */}
      {activeSubTab === 'admins' && (
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Admin Accounts & Role Assignment</h3>
              <p style={{ color: 'var(--text-muted)' }}>Generate users with auto-formatted ID <code>Role/4-digit ID/Year</code> and unique passwords.</p>
            </div>
            <button onClick={() => setUserModalOpen(true)} className="btn-primary">
              <Plus size={18} /> Create & Promote New Admin User
            </button>
          </div>

          <ExportButtons title="Admins Directory" headers={['username', 'full_name', 'role', 'default_password']} rows={usersList} filename="admins_list" />

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Assigned Role</th>
                  <th>Default Password</th>
                  <th>Control Action</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u.id}>
                    <td><code>{u.username}</code></td>
                    <td><strong>{u.full_name}</strong></td>
                    <td><span className="badge badge-info">{u.role}</span></td>
                    <td><code>{u.default_password}</code></td>
                    <td>
                      <button 
                        onClick={() => {
                          setSelectedUserForPasswordReset(u);
                          setResetPasswordInput(u.default_password);
                          setPasswordResetModalOpen(true);
                        }} 
                        className="btn-secondary btn-sm"
                      >
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 10. REPORTS INBOX SUB-DASHBOARD (Categorized & Seen/Unseen Status) */}
      {activeSubTab === 'reports' && (
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-700)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Inbox size={22} className="text-primary-600" /> Inter-Dashboard Reports Inbox
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                Reports categorized by sender role origin with real-time New/Unseen & Old/Seen tracking.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button" 
                onClick={handleMarkAllReportsSeen}
                className="btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem' }}
              >
                <CheckCircle size={15} /> Mark All as Seen
              </button>
              <ExportButtons title="Incoming Reports Inbox" headers={['sender_role', 'title', 'content', 'status', 'is_seen', 'registrar_comments', 'created_at']} rows={reportsList} filename="reports_inbox" />
            </div>
          </div>

          {/* Metric Cards Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Inbox Reports</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-700)' }}>{reportsList.length}</div>
            </div>
            <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={13} /> Unseen / New Reports
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#dc2626' }}>
                {reportsList.filter(r => !r.is_seen).length}
              </div>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Seen / Old Reports</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#059669' }}>
                {reportsList.filter(r => r.is_seen).length}
              </div>
            </div>
            <div style={{ background: 'var(--primary-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-800)', textTransform: 'uppercase' }}>Reviewed / Approved</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-800)' }}>
                {reportsList.filter(r => r.status === 'Reviewed' || r.status === 'Approved').length}
              </div>
            </div>
          </div>

          {/* Category Filter Pills (Sender Role Categories) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>
              Filter By Sender Category (From Whom Report Originated):
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {['ALL', 'Site Worker', 'Store Manager', 'Accountant', 'Finance', 'Manager', 'External Partner'].map(cat => {
                const count = cat === 'ALL' 
                  ? reportsList.length 
                  : reportsList.filter(r => r.sender_role === cat).length;
                const unseenCatCount = cat === 'ALL'
                  ? reportsList.filter(r => !r.is_seen).length
                  : reportsList.filter(r => r.sender_role === cat && !r.is_seen).length;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setReportCategoryFilter(cat)}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: '20px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.8rem',
                      fontWeight: reportCategoryFilter === cat ? 700 : 500,
                      backgroundColor: reportCategoryFilter === cat ? 'var(--primary-700)' : 'var(--bg-surface)',
                      color: reportCategoryFilter === cat ? '#ffffff' : 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    <span>{cat === 'ALL' ? 'All Categories' : cat}</span>
                    <span style={{
                      fontSize: '0.7rem',
                      background: reportCategoryFilter === cat ? 'rgba(255,255,255,0.25)' : 'var(--primary-100)',
                      color: reportCategoryFilter === cat ? '#ffffff' : 'var(--primary-800)',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      fontWeight: 800
                    }}>
                      {count} {unseenCatCount > 0 && `(${unseenCatCount} new)`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Read / Unread (Seen / Unseen) Status Filter Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', background: 'var(--bg-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Status View:</span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => setReportSeenFilter('ALL')}
                  style={{
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.78rem',
                    borderRadius: '4px',
                    border: 'none',
                    fontWeight: reportSeenFilter === 'ALL' ? 700 : 500,
                    background: reportSeenFilter === 'ALL' ? 'var(--primary-600)' : 'transparent',
                    color: reportSeenFilter === 'ALL' ? '#fff' : 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  All Statuses
                </button>
                <button
                  type="button"
                  onClick={() => setReportSeenFilter('UNSEEN')}
                  style={{
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.78rem',
                    borderRadius: '4px',
                    border: 'none',
                    fontWeight: reportSeenFilter === 'UNSEEN' ? 700 : 500,
                    background: reportSeenFilter === 'UNSEEN' ? '#dc2626' : 'transparent',
                    color: reportSeenFilter === 'UNSEEN' ? '#fff' : 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  Unseen (New) Only
                </button>
                <button
                  type="button"
                  onClick={() => setReportSeenFilter('SEEN')}
                  style={{
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.78rem',
                    borderRadius: '4px',
                    border: 'none',
                    fontWeight: reportSeenFilter === 'SEEN' ? 700 : 500,
                    background: reportSeenFilter === 'SEEN' ? '#059669' : 'transparent',
                    color: reportSeenFilter === 'SEEN' ? '#fff' : 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  Seen (Old) Only
                </button>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing {filteredReports.length} of {reportsList.length} total reports
            </div>
          </div>

          {/* Categorized Reports Data Table */}
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sender Category (Role)</th>
                  <th>New / Old Status</th>
                  <th>Report Title</th>
                  <th>Content Preview</th>
                  <th>Approval Status</th>
                  <th>Registrar Comments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No reports match the selected sender category or seen/unseen filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map(r => {
                    const isUnseen = !r.is_seen;
                    return (
                      <tr 
                        key={r.id}
                        style={{
                          backgroundColor: isUnseen ? 'rgba(239, 68, 68, 0.04)' : 'transparent',
                          borderLeft: isUnseen ? '4px solid #ef4444' : '1px solid var(--border-color)'
                        }}
                      >
                        <td>
                          <span className="badge badge-info" style={{ fontWeight: 700, padding: '3px 8px' }}>
                            {r.sender_role}
                          </span>
                        </td>
                        <td>
                          {isUnseen ? (
                            <span 
                              className="badge badge-danger" 
                              style={{ 
                                animation: 'pulse 1.5s infinite', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '3px',
                                fontWeight: 800
                              }}
                            >
                              <Sparkles size={12} /> NEW (UNSEEN)
                            </span>
                          ) : (
                            <span 
                              className="badge badge-secondary" 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '3px',
                                background: 'var(--border-color)',
                                color: 'var(--text-secondary)'
                              }}
                            >
                              <CheckCircle size={12} /> SEEN (OLD)
                            </span>
                          )}
                        </td>
                        <td>
                          <strong style={{ color: isUnseen ? 'var(--primary-800)' : 'var(--text-primary)' }}>
                            {r.title}
                          </strong>
                          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                            {r.created_at ? new Date(r.created_at).toLocaleString() : 'Recent'}
                          </div>
                        </td>
                        <td style={{ maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {r.content}
                        </td>
                        <td>
                          <span className={`badge ${r.status === 'Approved' ? 'badge-success' : r.status === 'Reviewed' ? 'badge-info' : 'badge-warning'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{r.registrar_comments || 'None'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button 
                              type="button"
                              onClick={() => {
                                setSelectedReport(r);
                                setRegistrarComment(r.registrar_comments || '');
                                if (!r.is_seen) {
                                  mockDb.updateRow('reports', r.id, { is_seen: true });
                                  refreshAllData();
                                }
                                setReportModalOpen(true);
                              }} 
                              className="btn-primary btn-sm"
                              style={{ padding: '3px 8px', fontSize: '0.78rem' }}
                            >
                              <Eye size={13} /> Review
                            </button>

                            <button 
                              type="button"
                              onClick={() => handleToggleReportSeen(r)} 
                              className="btn-secondary btn-sm"
                              style={{ padding: '3px 8px', fontSize: '0.78rem' }}
                              title={r.is_seen ? 'Mark as New/Unseen' : 'Mark as Old/Seen'}
                            >
                              {r.is_seen ? 'Mark Unseen' : 'Mark Seen'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 13. PARTNER MACHINERY AGREEMENTS SUB-DASHBOARD */}
      {activeSubTab === 'partnerRequests' && (
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-700)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={22} className="text-primary-600" /> Organization Partner Machinery Agreements
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                Review machinery rental agreement requests submitted by partner organizations. Approved items automatically post to the active rental fleet catalog.
              </p>
            </div>
            <ExportButtons title="Partner Machinery Rental Agreement Proposals" headers={['organization_name', 'contact_name', 'contact_email', 'contact_phone', 'machinery_name', 'machinery_type', 'plate_number', 'quantity', 'proposed_rate', 'agreement_duration', 'status']} rows={partnerRequestsList} filename="partner_machinery_agreements" />
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Organization & Representative</th>
                  <th>Machinery & Type</th>
                  <th>Plate #</th>
                  <th>Qty</th>
                  <th>Proposed Rate ($/hr)</th>
                  <th>Agreement Duration</th>
                  <th>Status</th>
                  <th>Admin Review Actions</th>
                </tr>
              </thead>
              <tbody>
                {partnerRequestsList.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No partner machinery rental agreement requests submitted yet. Partner organizations can submit proposals from the Machineries Directory.
                    </td>
                  </tr>
                ) : (
                  partnerRequestsList.map(req => (
                    <tr key={req.id}>
                      <td>
                        <strong>{req.organization_name}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {req.contact_name} ({req.contact_phone || req.contact_email})
                        </div>
                      </td>
                      <td>
                        <strong>{req.machinery_name}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{req.machinery_type}</div>
                      </td>
                      <td><code>{req.plate_number}</code></td>
                      <td><strong>{req.quantity}</strong></td>
                      <td><strong style={{ color: 'var(--primary-700)', fontSize: '1rem' }}>${req.proposed_rate}/hr</strong></td>
                      <td>{req.agreement_duration}</td>
                      <td>
                        <span className={`badge ${req.status === 'Approved' ? 'badge-success' : req.status === 'Declined' ? 'badge-danger' : 'badge-warning'}`}>
                          {req.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button 
                            type="button"
                            onClick={() => {
                              setSelectedPartnerRequest(req);
                              setPartnerDetailModalOpen(true);
                            }}
                            className="btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: '0.78rem' }}
                          >
                            <Eye size={14} /> Review
                          </button>

                          {req.status === 'Pending' && (
                            <>
                              <button 
                                type="button"
                                onClick={() => handleApprovePartnerRequest(req)} 
                                className="btn-primary btn-sm"
                                style={{ backgroundColor: '#16a34a', padding: '3px 8px', fontSize: '0.78rem' }}
                              >
                                <CheckCircle size={14} /> Approve & Add to Fleet
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleDeclinePartnerRequest(req)} 
                                className="btn-danger btn-sm"
                                style={{ padding: '3px 8px', fontSize: '0.78rem' }}
                              >
                                Decline
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 11. VACANCIES ADMIN SUB-DASHBOARD */}
      {activeSubTab === 'vacanciesAdmin' && (
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Manage Vacancies & Schedule Exams</h3>
            <button onClick={() => {
              setEditingVacancy(null);
              setVacancyForm({
                job_title: '',
                job_type: 'Permanent',
                description: '',
                place_of_application: 'Head Office - Addis Ababa',
                expiry_date: new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
                written_exam_date: '',
                written_exam_venue: 'Main Assembly Hall',
                interview_date: '',
                interview_venue: 'HR Boardroom'
              });
              setVacancyModalOpen(true);
            }} className="btn-primary">
              <Plus size={18} /> Post New Vacancy
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Expiry Date</th>
                  <th>Written Exam Date & Venue</th>
                  <th>Interview Date & Venue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vacanciesList.map(v => (
                  <tr key={v.id}>
                    <td><strong>{v.job_title}</strong></td>
                    <td>{v.job_type}</td>
                    <td>{v.expiry_date}</td>
                    <td>{v.written_exam_date ? `${new Date(v.written_exam_date).toLocaleDateString()} (${v.written_exam_venue})` : 'Not Set'}</td>
                    <td>{v.interview_date ? `${new Date(v.interview_date).toLocaleDateString()} (${v.interview_venue})` : 'Not Set'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button 
                          onClick={() => {
                            setEditingVacancy(v);
                            setVacancyForm({
                              job_title: v.job_title || '',
                              job_type: v.job_type || 'Permanent',
                              description: v.description || '',
                              place_of_application: v.place_of_application || '',
                              expiry_date: v.expiry_date || '',
                              written_exam_date: v.written_exam_date || '',
                              written_exam_venue: v.written_exam_venue || '',
                              interview_date: v.interview_date || '',
                              interview_venue: v.interview_venue || ''
                            });
                            setVacancyModalOpen(true);
                          }}
                          className="btn-secondary btn-sm"
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button 
                          onClick={() => {
                            mockDb.deleteRow('vacancies', v.id);
                            refreshAllData();
                            showAlert('Vacancy removed.', 'info');
                          }} 
                          className="btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Applicant Exam & Interview Grading Table */}
          <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-700)', marginBottom: '1rem' }}>
              Publish Applicant Written Exam & Interview Results
            </h4>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Applicant Name & Contact</th>
                    <th>Stage 1: Written Status</th>
                    <th>Stage 1: Score</th>
                    <th>Stage 2: Interview Status</th>
                    <th>Stage 2: Score</th>
                    <th>Final Decision</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applicationsList.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                        No applicant submissions found yet. Applicants apply from Careers Page.
                      </td>
                    </tr>
                  ) : (
                    applicationsList.map(app => (
                      <tr key={app.id}>
                        <td>
                          <strong>{app.full_name}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.email} ({app.phone})</div>
                        </td>
                        <td>
                          <span className={`badge ${app.written_exam_status === 'Passed' ? 'badge-success' : app.written_exam_status === 'Failed' ? 'badge-danger' : 'badge-warning'}`}>
                            {app.written_exam_status || 'Pending'}
                          </span>
                        </td>
                        <td><strong>{app.written_exam_score || 0} / 100</strong></td>
                        <td>
                          <span className={`badge ${app.interview_status === 'Passed' ? 'badge-success' : app.interview_status === 'Failed' ? 'badge-danger' : 'badge-warning'}`}>
                            {app.interview_status || 'Pending'}
                          </span>
                        </td>
                        <td><strong>{app.interview_score || 0} / 100</strong></td>
                        <td>
                          <span className={`badge ${app.final_result === 'Passed & Selected' ? 'badge-success' : app.final_result === 'Failed' ? 'badge-danger' : 'badge-info'}`}>
                            {app.final_result || 'Pending'}
                          </span>
                        </td>
                        <td>
                          <button onClick={() => handleOpenPublishResultModal(app)} className="btn-primary btn-sm">
                            <Award size={14} /> Grade & Publish
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 12. PORTAL SETTINGS SUB-DASHBOARD */}
      {activeSubTab === 'settings' && (
        <div className="card-glass" style={{ padding: '2rem', maxWidth: '800px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--primary-700)' }}>
            Custom Portal Branding & Content Settings
          </h3>
          <form onSubmit={handleSaveSettings}>
            <div className="form-group">
              <label className="form-label">Portal System Title</label>
              <input type="text" className="form-control" value={settings.site_title || ''} onChange={e => setSettings({ ...settings, site_title: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Logo Image (Pick File from Directory) *</label>
                <input type="file" accept="image/*" className="form-control" onChange={handleLogoPick} />
                {settings.logo_url && (
                  <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={settings.logo_url} alt="Logo Preview" style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover', border: '2px solid var(--primary-500)' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary-600)', fontWeight: 600 }}>Logo File Loaded</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Hero Background Image (Pick File from Directory) *</label>
                <input type="file" accept="image/*" className="form-control" onChange={handleHeroBgPick} />
                {settings.hero_bg_url && (
                  <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={settings.hero_bg_url} alt="Hero Preview" style={{ width: '90px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '2px solid var(--primary-500)' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary-600)', fontWeight: 600 }}>Hero Image Loaded</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input type="text" className="form-control" value={settings.contact_phone || ''} onChange={e => setSettings({ ...settings, contact_phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <input type="text" className="form-control" value={settings.contact_email || ''} onChange={e => setSettings({ ...settings, contact_email: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location Address</label>
              <input type="text" className="form-control" value={settings.church_organization_address || ''} onChange={e => setSettings({ ...settings, church_organization_address: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Google Maps Embed URL</label>
              <textarea rows={3} className="form-control" value={settings.google_map_embed_url || ''} onChange={e => setSettings({ ...settings, google_map_embed_url: e.target.value })} />
            </div>

            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '1.5rem 0 1rem 0', color: 'var(--primary-700)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem' }}>
              Social Media Channel Links
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Telegram Link / Username</label>
                <input type="text" className="form-control" placeholder="https://t.me/yourchannel" value={settings.telegram_url || ''} onChange={e => setSettings({ ...settings, telegram_url: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp Link / Phone</label>
                <input type="text" className="form-control" placeholder="https://wa.me/251911000111" value={settings.whatsapp_url || ''} onChange={e => setSettings({ ...settings, whatsapp_url: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">TikTok URL</label>
                <input type="text" className="form-control" placeholder="https://tiktok.com/@youraccount" value={settings.tiktok_url || ''} onChange={e => setSettings({ ...settings, tiktok_url: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Facebook URL</label>
                <input type="text" className="form-control" placeholder="https://facebook.com/yourpage" value={settings.facebook_url || ''} onChange={e => setSettings({ ...settings, facebook_url: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Instagram URL</label>
                <input type="text" className="form-control" placeholder="https://instagram.com/yourhandle" value={settings.instagram_url || ''} onChange={e => setSettings({ ...settings, instagram_url: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Twitter / X URL</label>
                <input type="text" className="form-control" placeholder="https://twitter.com/yourhandle" value={settings.twitter_url || ''} onChange={e => setSettings({ ...settings, twitter_url: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">YouTube URL</label>
                <input type="text" className="form-control" placeholder="https://youtube.com/@yourchannel" value={settings.youtube_url || ''} onChange={e => setSettings({ ...settings, youtube_url: e.target.value })} />
              </div>
            </div>

            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '1.5rem 0 1rem 0', color: 'var(--primary-700)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem' }}>
              Copyright & Footer Branding Settings
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Copyright Entity / Company Text *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Construction Machinery Rental Organization" 
                  value={settings.copyright_text || ''} 
                  onChange={e => setSettings({ ...settings, copyright_text: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Copyright Year *</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="2026" 
                  value={settings.copyright_year || 2026} 
                  onChange={e => setSettings({ ...settings, copyright_year: Number(e.target.value) })} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="submit" className="btn-primary">
                <CheckCircle size={18} /> Save & Apply Portal Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 14. MOMENTS & GALLERY ADMIN SUB-DASHBOARD */}
      {activeSubTab === 'momentsAdmin' && (
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-700)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ImageIcon size={22} className="text-primary-600" /> Moments & Gallery Media Management
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                Post site operational photos, video updates, and announcements directly to the public home portal gallery.
              </p>
            </div>
            <button 
              onClick={() => {
                setEditingMoment(null);
                setMomentForm({ title: '', media_type: 'image', media_url: '', description: '' });
                setMomentModalOpen(true);
              }} 
              className="btn-primary"
            >
              <Plus size={18} /> Post New Gallery Moment
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {momentsList.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                No gallery moments posted yet. Click "Post New Gallery Moment" above to upload photos or videos.
              </div>
            ) : (
              momentsList.map(m => (
                <div key={m.id} className="card-glass" style={{ padding: '1rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="badge badge-info" style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
                      {m.media_type} Moment
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {m.created_at ? new Date(m.created_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                  {m.media_type === 'video' ? (
                    <video src={m.media_url} controls style={{ width: '100%', height: '160px', borderRadius: '8px', objectFit: 'cover' }} />
                  ) : (
                    <img src={m.media_url} alt={m.title} style={{ width: '100%', height: '160px', borderRadius: '8px', objectFit: 'cover' }} />
                  )}
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '0.65rem 0 0.25rem 0' }}>{m.title}</h4>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', lineHeight: 1.4 }}>
                    {m.description || 'No description provided.'}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => {
                        setEditingMoment(m);
                        setMomentForm({
                          title: m.title || '',
                          media_type: m.media_type || 'image',
                          media_url: m.media_url || '',
                          description: m.description || ''
                        });
                        setMomentModalOpen(true);
                      }} 
                      className="btn-secondary btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteMoment(m.id)} 
                      className="btn-danger btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Machinery Modal Form */}
      {machineryModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              {editingMachinery ? 'Edit Machinery Details' : 'Add & Post New Machinery'}
            </h3>
            <form onSubmit={handleSaveMachinery}>
              <div className="form-group">
                <label className="form-label">Machinery Name *</label>
                <input type="text" name="name" className="form-control" required defaultValue={editingMachinery?.name || ''} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Type *</label>
                  <input type="text" name="type" className="form-control" required defaultValue={editingMachinery?.type || 'Excavator'} />
                </div>
                <div className="form-group">
                  <label className="form-label">Unique Unit Plate Numbers (Comma-separated) *</label>
                  <input 
                    type="text" 
                    name="plate_number" 
                    className="form-control" 
                    required 
                    placeholder="e.g. ET-30241-AA, ET-30242-AA, ET-30243-AA"
                    defaultValue={editingMachinery?.plate_number || ''} 
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px', display: 'block' }}>
                    * Each single machinery unit has a unique plate number. Separate multiple units with commas.
                  </small>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Quantity *</label>
                  <input type="number" name="quantity" className="form-control" required min="1" defaultValue={editingMachinery?.quantity || 1} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hourly Price ($) *</label>
                  <input type="number" name="price_per_hour" className="form-control" required defaultValue={editingMachinery?.price_per_hour || 100} />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount (%)</label>
                  <input type="number" name="discount_percent" className="form-control" defaultValue={editingMachinery?.discount_percent || 0} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Machinery Image (Pick File from Directory) *</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="form-control" 
                  onChange={handleMachineryImagePick} 
                />
                {(machineryImage || editingMachinery?.image_url) && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img 
                      src={machineryImage || editingMachinery?.image_url} 
                      alt="Machinery Preview" 
                      style={{ width: '110px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '2px solid var(--primary-500)' }} 
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary-600)', fontWeight: 600 }}>File Preview Loaded</span>
                  </div>
                )}
                <input type="hidden" name="image_url" value={machineryImage || editingMachinery?.image_url || ''} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-control" rows={3} defaultValue={editingMachinery?.description || ''} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setMachineryModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Machinery</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Creation Modal */}
      {userModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              Create & Assign New Role Admin User
            </h3>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" className="form-control" required value={newUserForm.full_name} onChange={e => setNewUserForm({ ...newUserForm, full_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">System Role *</label>
                <select className="form-select" value={newUserForm.role} onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value })}>
                  <option value="Main Registrar Admin">Main Registrar Admin</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Finance">Finance</option>
                  <option value="Store Manager">Store Manager</option>
                  <option value="Manager">Manager</option>
                  <option value="Site Worker">Site Worker</option>
                  <option value="Reporter">Reporter</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input type="email" className="form-control" required value={newUserForm.email} onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input type="text" className="form-control" value={newUserForm.contact} onChange={e => setNewUserForm({ ...newUserForm, contact: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setUserModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Generate Credentials</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vacancy Creation Modal */}
      {vacancyModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              {editingVacancy ? 'Edit Posted Vacancy & Schedule Exams' : 'Post Job Vacancy & Schedule Exams'}
            </h3>
            <form onSubmit={handleSaveVacancy}>
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input type="text" className="form-control" required value={vacancyForm.job_title} onChange={e => setVacancyForm({ ...vacancyForm, job_title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea rows={3} className="form-control" required value={vacancyForm.description} onChange={e => setVacancyForm({ ...vacancyForm, description: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Expiry Date *</label>
                  <input type="date" className="form-control" required value={vacancyForm.expiry_date} onChange={e => setVacancyForm({ ...vacancyForm, expiry_date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Place of Application</label>
                  <input type="text" className="form-control" value={vacancyForm.place_of_application} onChange={e => setVacancyForm({ ...vacancyForm, place_of_application: e.target.value })} />
                </div>
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '1rem 0 0.5rem 0', color: 'var(--primary-700)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                1. Call for Written Exam Schedule
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Written Exam Date & Time</label>
                  <input type="datetime-local" className="form-control" value={vacancyForm.written_exam_date} onChange={e => setVacancyForm({ ...vacancyForm, written_exam_date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Written Exam Venue / Location *</label>
                  <input type="text" className="form-control" placeholder="e.g. Main Assembly Hall, 2nd Floor" value={vacancyForm.written_exam_venue} onChange={e => setVacancyForm({ ...vacancyForm, written_exam_venue: e.target.value })} />
                </div>
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '1rem 0 0.5rem 0', color: 'var(--primary-700)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                2. Call for Interview Schedule
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Interview Date & Time</label>
                  <input type="datetime-local" className="form-control" value={vacancyForm.interview_date} onChange={e => setVacancyForm({ ...vacancyForm, interview_date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Interview Venue / Location *</label>
                  <input type="text" className="form-control" placeholder="e.g. HR Boardroom, Executive Block" value={vacancyForm.interview_venue} onChange={e => setVacancyForm({ ...vacancyForm, interview_venue: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setVacancyModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingVacancy ? 'Save Vacancy Changes' : 'Publish Posting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Report Modal */}
      {reportModalOpen && selectedReport && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>
              Review Report from {selectedReport.sender_role}
            </h3>
            <div style={{ background: 'var(--primary-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <h4 style={{ fontWeight: 700 }}>{selectedReport.title}</h4>
              <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{selectedReport.content}</p>
            </div>
            <div className="form-group">
              <label className="form-label">Registrar Feedback & Comments</label>
              <textarea 
                rows={4} 
                className="form-control" 
                value={registrarComment} 
                onChange={e => setRegistrarComment(e.target.value)} 
                placeholder="Type your response/comments..."
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setReportModalOpen(false)}>Cancel</button>
              <button 
                type="button" 
                className="btn-primary"
                onClick={() => {
                  mockDb.updateRow('reports', selectedReport.id, { status: 'Approved', registrar_comments: registrarComment });
                  showAlert('Report approved and comments sent back.', 'success');
                  setReportModalOpen(false);
                  refreshAllData();
                }}
              >
                Approve & Send Comments
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Edit Hourly Price Modal Form */}
      {priceModalOpen && selectedMachineryForPrice && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                Edit Machinery Hourly Rental Rate
              </h3>
              <button onClick={() => setPriceModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ background: 'var(--primary-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <strong style={{ color: 'var(--primary-900)' }}>{selectedMachineryForPrice.name}</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Plate: {selectedMachineryForPrice.plate_number}</div>
            </div>
            <form onSubmit={handleSavePriceModal}>
              <div className="form-group">
                <label className="form-label">New Price Per Hour ($) *</label>
                <input 
                  type="number" 
                  className="form-control" 
                  required 
                  min="0"
                  step="0.5"
                  value={newHourlyPrice}
                  onChange={e => setNewHourlyPrice(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setPriceModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary"><CheckCircle size={18} /> Update Price</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Update Discount Modal Form */}
      {discountModalOpen && selectedMachineryForDiscount && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                Update Rental Discount Percentage
              </h3>
              <button onClick={() => setDiscountModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ background: 'var(--primary-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <strong style={{ color: 'var(--primary-900)' }}>{selectedMachineryForDiscount.name}</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Plate: {selectedMachineryForDiscount.plate_number}</div>
            </div>
            <form onSubmit={handleSaveDiscountModal}>
              <div className="form-group">
                <label className="form-label">Discount Percentage (%) *</label>
                <input 
                  type="number" 
                  className="form-control" 
                  required 
                  min="0"
                  max="100"
                  step="0.5"
                  value={newDiscountPercent}
                  onChange={e => setNewDiscountPercent(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setDiscountModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary"><CheckCircle size={18} /> Update Discount</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Reset Password Modal Form */}
      {passwordResetModalOpen && selectedUserForPasswordReset && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                Reset User Default Password
              </h3>
              <button onClick={() => setPasswordResetModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ background: 'var(--primary-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <strong style={{ color: 'var(--primary-900)' }}>{selectedUserForPasswordReset.full_name}</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Username: {selectedUserForPasswordReset.username} | Role: {selectedUserForPasswordReset.role}</div>
            </div>
            <form onSubmit={handleSavePasswordResetModal}>
              <div className="form-group">
                <label className="form-label">New Default Password *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  minLength={6}
                  value={resetPasswordInput}
                  onChange={e => setResetPasswordInput(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setPasswordResetModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary"><CheckCircle size={18} /> Confirm Password Reset</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Grade & Publish Results Modal */}
      {resultModalOpen && selectedApplicant && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              Publish Exam & Interview Results for {selectedApplicant.full_name}
            </h3>
            <form onSubmit={handleSaveApplicantResults}>
              {/* Stage 1: Written Exam */}
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0.5rem 0 0.5rem 0', color: 'var(--primary-700)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                Stage 1: Written Examination Evaluation
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Written Exam Status *</label>
                  <select className="form-select" value={resultForm.written_exam_status} onChange={e => setResultForm({ ...resultForm, written_exam_status: e.target.value })}>
                    <option value="Pending">Pending Evaluation</option>
                    <option value="Passed">Passed Stage 1 (Written Exam)</option>
                    <option value="Failed">Failed Stage 1</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Written Score (out of 100)</label>
                  <input type="number" className="form-control" min="0" max="100" value={resultForm.written_exam_score} onChange={e => setResultForm({ ...resultForm, written_exam_score: Number(e.target.value) })} />
                </div>
              </div>

              {/* Stage 2: Interview */}
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '1rem 0 0.5rem 0', color: 'var(--primary-700)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                Stage 2: Oral Interview Evaluation
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Interview Status *</label>
                  <select className="form-select" value={resultForm.interview_status} onChange={e => setResultForm({ ...resultForm, interview_status: e.target.value })}>
                    <option value="Pending">Pending Interview</option>
                    <option value="Passed">Passed Stage 2 (Interview)</option>
                    <option value="Failed">Failed Stage 2</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Interview Score (out of 100)</label>
                  <input type="number" className="form-control" min="0" max="100" value={resultForm.interview_score} onChange={e => setResultForm({ ...resultForm, interview_score: Number(e.target.value) })} />
                </div>
              </div>

              {/* Final Result */}
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '1rem 0 0.5rem 0', color: 'var(--primary-700)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                Final Employment Selection Status
              </h4>
              <div className="form-group">
                <label className="form-label">Overall Final Decision *</label>
                <select className="form-select" value={resultForm.final_result} onChange={e => setResultForm({ ...resultForm, final_result: e.target.value })}>
                  <option value="Pending">Pending Final Selection</option>
                  <option value="Passed & Selected">Passed & Selected for Employment</option>
                  <option value="Failed">Failed / Regretted</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Evaluator Feedback & Remarks</label>
                <textarea rows={3} className="form-control" placeholder="Comments on written exam or interview performance..." value={resultForm.evaluator_remarks} onChange={e => setResultForm({ ...resultForm, evaluator_remarks: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setResultModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  <Award size={18} /> Publish Results Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Partner Machinery Agreement Request Review Modal */}
      {partnerDetailModalOpen && selectedPartnerRequest && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-700)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={20} className="text-primary-600" /> Review Partner Machinery Rental Agreement
              </h3>
              <button onClick={() => setPartnerDetailModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {selectedPartnerRequest.image_url && (
              <div style={{ width: '100%', height: '180px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem', background: 'var(--primary-50)' }}>
                <img src={selectedPartnerRequest.image_url} alt={selectedPartnerRequest.machinery_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', background: 'var(--primary-50)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Renting Organization</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-900)' }}>{selectedPartnerRequest.organization_name}</div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {selectedPartnerRequest.contact_name} ({selectedPartnerRequest.contact_email} | {selectedPartnerRequest.contact_phone})
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Agreement Status</span>
                <div>
                  <span className={`badge ${selectedPartnerRequest.status === 'Approved' ? 'badge-success' : selectedPartnerRequest.status === 'Declined' ? 'badge-danger' : 'badge-warning'}`}>
                    {selectedPartnerRequest.status}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
              <div><strong>Machinery:</strong> {selectedPartnerRequest.machinery_name}</div>
              <div><strong>Type:</strong> {selectedPartnerRequest.machinery_type}</div>
              <div><strong>Plate #:</strong> <code>{selectedPartnerRequest.plate_number}</code></div>
              <div><strong>Quantity:</strong> {selectedPartnerRequest.quantity} Unit(s)</div>
              <div><strong>Proposed Rate:</strong> <strong style={{ color: 'var(--primary-700)' }}>${selectedPartnerRequest.proposed_rate}/hr</strong></div>
              <div><strong>Duration:</strong> {selectedPartnerRequest.agreement_duration}</div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Agreement Details & Machinery Specs
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0, whiteSpace: 'pre-wrap' }}>
                {selectedPartnerRequest.description || 'No additional agreement description provided.'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setPartnerDetailModalOpen(false)}>Close</button>
              {selectedPartnerRequest.status === 'Pending' && (
                <>
                  <button 
                    type="button" 
                    onClick={() => {
                      handleDeclinePartnerRequest(selectedPartnerRequest);
                      setPartnerDetailModalOpen(false);
                    }} 
                    className="btn-danger"
                  >
                    Decline Proposal
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      handleApprovePartnerRequest(selectedPartnerRequest);
                      setPartnerDetailModalOpen(false);
                    }} 
                    className="btn-primary" 
                    style={{ backgroundColor: '#16a34a' }}
                  >
                    <CheckCircle size={18} /> Approve & Add to Active Inventory
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MOMENT POST / EDIT MODAL */}
      {momentModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
          <div className="card-glass" style={{ width: '100%', maxWidth: '550px', padding: '1.75rem', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                {editingMoment ? 'Edit Gallery Moment' : 'Post New Gallery Moment'}
              </h3>
              <button onClick={() => setMomentModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveMoment}>
              <div className="form-group">
                <label className="form-label">Moment Title *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  placeholder="e.g. Modjo Expressway Earthmoving Progress" 
                  value={momentForm.title} 
                  onChange={e => setMomentForm({ ...momentForm, title: e.target.value })} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Media Type *</label>
                <select 
                  className="form-control" 
                  value={momentForm.media_type} 
                  onChange={e => setMomentForm({ ...momentForm, media_type: e.target.value })}
                >
                  <option value="image">Photo / Image</option>
                  <option value="video">Video Highlight</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Upload Image / Video File (Pick File from Directory) *</label>
                <input 
                  type="file" 
                  accept={momentForm.media_type === 'video' ? 'video/*' : 'image/*'} 
                  className="form-control" 
                  onChange={handleMomentFilePick} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Or Direct Media File URL</label>
                <input 
                  type="url" 
                  className="form-control" 
                  placeholder="https://..." 
                  value={momentForm.media_url} 
                  onChange={e => setMomentForm({ ...momentForm, media_url: e.target.value })} 
                />
              </div>

              {momentForm.media_url && (
                <div style={{ marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden', maxHeight: '180px' }}>
                  {momentForm.media_type === 'video' ? (
                    <video src={momentForm.media_url} controls style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                  ) : (
                    <img src={momentForm.media_url} alt="Preview" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                  )}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Description / Site Details</label>
                <textarea 
                  rows={3} 
                  className="form-control" 
                  placeholder="Provide context or updates about this project moment..." 
                  value={momentForm.description} 
                  onChange={e => setMomentForm({ ...momentForm, description: e.target.value })} 
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setMomentModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <CheckCircle size={16} /> {editingMoment ? 'Update Moment' : 'Post Moment to Live Portal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
