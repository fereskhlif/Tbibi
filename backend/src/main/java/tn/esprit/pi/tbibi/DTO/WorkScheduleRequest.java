package tn.esprit.pi.tbibi.DTO;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkScheduleRequest {

    private Integer doctorId;

    /** Daily work start time — "HH:mm" e.g. "08:00" */
    private String workStart;

    /** Daily work end time — "HH:mm" e.g. "16:00" */
    private String workEnd;

    /** Minutes per consultation slot — e.g. 30 */
    private int consultationMinutes;

    /**
     * Days of the week the doctor does NOT work.
     * Values must match {@link java.time.DayOfWeek} names: MONDAY, TUESDAY, etc.
     * e.g. ["FRIDAY", "SATURDAY"]
     */
    private List<String> restDays;

    /**
     * Recurring time blocks that apply to every working day.
     * e.g. [{ from:"12:00", to:"14:00" }, { from:"09:00", to:"09:30" }]
     */
    private List<UnavailabilityWindow> unavailableWindows;
}
