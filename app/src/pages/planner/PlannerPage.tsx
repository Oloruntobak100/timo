import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  User,
  Briefcase,
  X,
  Edit2,
  Trash2,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useEntityStore } from '@/store/entityStore';
import { mockApi } from '@/lib/api';
import { toast } from 'sonner';
import type { PlannerEvent, Job, Employee } from '@/types';

interface EventFormData {
  title: string;
  type: 'site-visit' | 'meeting' | 'deadline' | 'delivery' | 'other';
  date: string;
  startTime: string;
  endTime: string;
  jobId?: string;
  assignedTo?: string;
  location?: string;
  notes: string;
}

const PlannerPage: React.FC = () => {
  const { activeCompany } = useEntityStore();
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<PlannerEvent | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    type: 'site-visit',
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    jobId: '',
    assignedTo: '',
    location: '',
    notes: '',
  });

  const accentColor = activeCompany.id === 1 ? '#3B82F6' : '#14B8A6';

  const eventTypes = [
    { value: 'site-visit', label: 'Site Visit', color: '#3B82F6', icon: MapPin },
    { value: 'meeting', label: 'Meeting', color: '#8B5CF6', icon: User },
    { value: 'deadline', label: 'Deadline', color: '#EF4444', icon: AlertCircle },
    { value: 'delivery', label: 'Delivery', color: '#10B981', icon: Briefcase },
    { value: 'other', label: 'Other', color: '#6B7280', icon: Calendar },
  ];

  useEffect(() => {
    loadData();
  }, [activeCompany.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [eventsData, jobsData, employeesData] = await Promise.all([
        mockApi.getPlannerEvents(activeCompany.id),
        mockApi.getJobs(activeCompany.id),
        mockApi.getEmployees(activeCompany.id),
      ]);
      setEvents(eventsData);
      setJobs(jobsData);
      setEmployees(employeesData);
    } catch (error) {
      toast.error('Failed to load planner data');
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter((event) => {
      const matchesDate = event.date === dateStr;
      const matchesType = filterType === 'all' || event.type === filterType;
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDate && matchesType && matchesSearch;
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setFormData({
      ...formData,
      date: date.toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleOpenModal = (event?: PlannerEvent) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        type: event.type,
        date: event.date,
        startTime: event.startTime || '09:00',
        endTime: event.endTime || '17:00',
        jobId: event.jobId || '',
        assignedTo: event.assignedTo || '',
        location: event.location || '',
        notes: event.notes || '',
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        type: 'site-visit',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        jobId: '',
        assignedTo: '',
        location: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const job = jobs.find((j) => j.id === formData.jobId);
      const employee = employees.find((e) => e.id === formData.assignedTo);

      const eventData = {
        ...formData,
        jobNumber: job?.jobNumber,
        assignedName: employee?.name,
      };

      if (editingEvent) {
        await mockApi.updatePlannerEvent(editingEvent.id, eventData, activeCompany.id);
        toast.success('Event updated successfully');
      } else {
        await mockApi.createPlannerEvent(eventData, activeCompany.id);
        toast.success('Event created successfully');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to save event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await mockApi.deletePlannerEvent(eventId, activeCompany.id);
      toast.success('Event deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const getEventTypeColor = (type: string) => {
    return eventTypes.find((t) => t.value === type)?.color || '#6B7280';
  };

  const getEventTypeIcon = (type: string) => {
    const iconType = eventTypes.find((t) => t.value === type)?.icon || Calendar;
    return iconType;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const today = new Date();
  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const days = getDaysInMonth(currentDate);
  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Planner</h1>
          <p className="text-slate-400 mt-1">Schedule and manage site visits, meetings, and deadlines</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1 border border-slate-700">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 text-white font-medium min-w-[140px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium transition-all"
            style={{ backgroundColor: accentColor }}
          >
            <Plus className="w-4 h-4" />
            New Event
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              filterType === 'all'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          {eventTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setFilterType(type.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2`}
              style={{
                backgroundColor: filterType === type.value ? `${type.color}30` : 'rgba(30, 41, 59, 0.5)',
                color: filterType === type.value ? type.color : '#94a3b8',
                border: `1px solid ${filterType === type.value ? type.color : 'rgba(51, 65, 85, 0.5)'}`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: type.color }}
              />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-slate-700/50">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="px-4 py-3 text-center text-sm font-semibold text-slate-400 uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 auto-rows-fr">
              {days.map((day, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.01 }}
                  onClick={() => day && handleDateClick(day)}
                  className={`min-h-[100px] p-2 border-b border-r border-slate-700/30 cursor-pointer transition-colors ${
                    day ? 'hover:bg-slate-700/30' : ''
                  } ${
                    day && isToday(day)
                      ? 'bg-blue-500/10'
                      : ''
                  }`}
                >
                  {day && (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-sm font-medium ${
                            isToday(day)
                              ? 'w-7 h-7 rounded-full flex items-center justify-center text-white'
                              : 'text-slate-300'
                          }`}
                          style={isToday(day) ? { backgroundColor: accentColor } : {}}
                        >
                          {day.getDate()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {getEventsForDate(day)
                          .slice(0, 3)
                          .map((event) => (
                            <motion.div
                              key={event.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenModal(event);
                              }}
                              className="text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                              style={{
                                backgroundColor: `${getEventTypeColor(event.type)}30`,
                                color: getEventTypeColor(event.type),
                              }}
                            >
                              {event.startTime} {event.title}
                            </motion.div>
                          ))}
                        {getEventsForDate(day).length > 3 && (
                          <div className="text-xs text-slate-500 px-2">
                            +{getEventsForDate(day).length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Upcoming Events */}
        <div className="space-y-4">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" style={{ color: accentColor }} />
              Upcoming Events
            </h3>
            <div className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">No upcoming events</p>
              ) : (
                upcomingEvents.map((event) => {
                  const EventIcon = getEventTypeIcon(event.type);
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors cursor-pointer"
                      onClick={() => handleOpenModal(event)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${getEventTypeColor(event.type)}20` }}
                        >
                          <EventIcon
                            className="w-4 h-4"
                            style={{ color: getEventTypeColor(event.type) }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{event.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(event.date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                            })}
                            {event.startTime && ` • ${event.startTime}`}
                          </p>
                          {event.location && (
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Event Type Legend */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Event Types</h3>
            <div className="space-y-2">
              {eventTypes.map((type) => (
                <div key={type.value} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: type.color }}
                  />
                  <span className="text-sm text-slate-400">{type.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {editingEvent ? 'Edit Event' : 'New Event'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Event Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter event title"
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Event Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {eventTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.value as any })}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm transition-all ${
                          formData.type === type.value
                            ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                            : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Time</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                      />
                      <span className="text-slate-400">-</span>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Related Job (Optional)</label>
                    <select
                      value={formData.jobId}
                      onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="">No Job</option>
                      {jobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.jobNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Assigned To (Optional)</label>
                    <select
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="">Unassigned</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Location (Optional)</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter location"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder="Add any additional notes..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  {editingEvent && (
                    <button
                      type="button"
                      onClick={() => {
                        handleDeleteEvent(editingEvent.id);
                        setIsModalOpen(false);
                      }}
                      className="px-4 py-2.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg text-white font-medium transition-all"
                    style={{ backgroundColor: accentColor }}
                  >
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlannerPage;
